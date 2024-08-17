export default function createPipeline(domainNames: string[]) {
  const pipeline = [
    {
      $match: {
        "_id.domainName": { $in: domainNames },
      },
    },
    {
      // Group entries from the DN collectors by the domain name
      $group: {
        _id: "$_id.domainName",
        // The result will have an array of documents, each representing a collection attempt
        documents: {
          $push: {
            collection_date: "$_id.timestamp",
            source: "$_id.collector",
            error: "$error",
            status_code: "$statusCode",
          },
        },
        // Consider the earliest collection date to be the "first seen" date
        first_seen: {
          $top: {
            sortBy: {
              "_id.timestamp": 1,
            },
            output: "$_id.timestamp",
          },
        },
      },
    },
    {
      // Join the domain names with the entries from the IP collectors
      // and process them to the final format
      $lookup: {
        from: "ip_data",
        localField: "_id",
        foreignField: "_id.domainName",
        pipeline: [
          // This internal aggregation pipeline processes the entries
          // selected for each domain name
          {
            $match: {
              "_id.domainName": { $in: domainNames },
            },
          },
          {
            // First group by IP/collector pair to extract the latest entry
            // This entry will be used to extract the geo and ASN data
            $group: {
              _id: {
                ip: "$_id.ip",
                collector: "$_id.collector",
              },
              // Extract the latest entry for each collector (for each IP)
              latest: {
                $top: {
                  sortBy: {
                    "_id.timestamp": -1,
                  },
                  output: "$$ROOT",
                },
              },
              // Also store metadata of the collection attempts
              all: {
                $push: {
                  collection_date: "$_id.timestamp",
                  source: "$_id.collector",
                  error: "$error",
                  status_code: "$statusCode",
                },
              },
            },
          },
          {
            // Now group only by IP to get a single document per IP
            $group: {
              _id: "$_id.ip",
              // Add an array of the latest results from each collector
              latest_data: {
                $push: {
                  k: "$_id.collector",
                  v: { $ifNull: ["$latest.data", null] },
                },
              },
              // Also propagate the array of all collection attempt metadata
              // This will create an array of arrays
              all: {
                $push: "$all",
              },
            },
          },
          {
            $project: {
              _id: 1,
              // Convert the array of latest results to an object
              // Collector names are keys, their data are values
              results: {
                $arrayToObject: "$latest_data",
              },
              // Reduce the array of arrays to a single array
              // (you cannot use $concatArrays here, it cannot accept an existing array of arrays!)
              all: {
                $reduce: {
                  input: "$all",
                  initialValue: [],
                  in: {
                    $concatArrays: ["$$value", "$$this"],
                  },
                },
              },
            },
          },
          {
            // Project the IP data to the final format
            $project: {
              _id: 0,
              ip: "$_id",
              geo: {
                country: "$results.geo-asn.countryCode",
                country_code: "$results.geo-asn.countryCode",
                region: "$results.geo-asn.region",
                region_code: "$results.geo-asn.regionCode",
                city: "$results.geo-asn.city",
                postal_code: "$results.geo-asn.postalCode",
                latitude: "$results.geo-asn.latitude",
                longitude: "$results.geo-asn.longitude",
                timezone: "$results.geo-asn.timezone",
              },
              asn: {
                asn: "$results.geo-asn.asn",
                as_org: "$results.geo-asn.asnOrg",
                network_address: "$results.geo-asn.networkAddress",
                prefix_len: "$results.geo-asn.prefixLength",
              },
              collection_results: {
                $sortArray: {
                  input: "$all",
                  sortBy: {
                    collection_date: 1,
                  },
                },
              },
              qradar_offense_source: null, // TODO
            },
          },
        ],
        as: "ip_addresses",
      },
    },
    // Join with the classification results collection
    {
      $lookup: {
        from: "classification_results",
        localField: "_id",
        foreignField: "domain_name",
        pipeline: [
          // This internal aggregation pipeline processes the entries
          // selected for each domain name
          {
            $match: {
              _id: { $in: domainNames },
            },
          },
          {
            // Group by domain name to extract the latest classification result
            $group: {
              _id: "$domain_name",
              // An object with the latest aggregate probability and description
              top: {
                $top: {
                  sortBy: { timestamp: -1 }, // Sort by timestamp in descending order
                  output: {
                    aggregate_probability: "$aggregate_probability",
                    aggregate_description: "$aggregate_description",
                    classification_results: "$classification_results",
                  },
                },
              },
            },
          },
          {
            // Project the data to the final format
            $project: {
              _id: 1,
              // Push the values from the "top" object to the root
              aggregate_probability: "$top.aggregate_probability",
              aggregate_description: "$top.aggregate_description",
              classification_results: "$top.classification_results",
            },
          },
        ],
        // The clf_agg field will be an array of the results from the "lookup", however,
        // as the internal pipeline groups by domain name, there will always be either none or only one element in the array
        as: "clf_agg",
      },
    },
    // For each domain name, extract the only element of the "clf_agg" array
    // (or set to null if the array is empty - no clf results found for the domain name)
    {
      $set: {
        clf_agg: {
          $cond: {
            if: { $gt: [{ $size: "$clf_agg" }, 0] },
            then: { $arrayElemAt: ["$clf_agg", 0] },
            else: null,
          },
        },
      },
    },
    // Project the domain data, joined with the corresponding IPs, to the final format
    // Sort the collection and classification results by date (ascending)
    // Convert nulls to default values
    {
      $project: {
        _id: 0,
        domain_name: "$_id",
        aggregate_probability: {
          $ifNull: ["$clf_agg.aggregate_probability", -1],
        },
        aggregate_description: {
          $ifNull: ["$clf_agg.aggregate_description", "not classified yet"],
        },
        ip_addresses: 1,
        classification_results: {
          $sortArray: {
            input: { $ifNull: ["$clf_agg.classification_results", []] },
            sortBy: {
              classification_date: 1,
            },
          },
        },
        first_seen: 1,
        collection_results: {
          $sortArray: {
            input: "$documents",
            sortBy: {
              collection_date: 1,
            },
          },
        },
        additional_info: null,
      },
    },
    // Convert the UNIX timestamps (ms) in classification_results to dates
    {
      $set: {
        classification_results: {
          $map: {
            input: "$classification_results",
            in: {
              classification_date: { $toDate: "$$this.classification_date" },
              probability: "$$this.probability",
              classifier: "$$this.classifier",
              description: "$$this.description",
              details: "$$this.details",
            },
          },
        },
      },
    },
  ]

  return pipeline
}
