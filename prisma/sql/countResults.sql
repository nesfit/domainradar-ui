-- @param {Int} $1:minProbability
-- @param {Int} $2:maxProbability
-- @param {String} $3:search
SELECT CEIL(3.3 * COUNT(*)) AS estimate
FROM "domain" TABLESAMPLE SYSTEM (33)
WHERE (
        "domain"."aggregate_probability" IS NOT NULL
        AND "domain"."aggregate_probability" >= $1
        AND "domain"."aggregate_probability" <= $2
        AND "domain"."domain_name" ILIKE '%' || $3 || '%'
    )