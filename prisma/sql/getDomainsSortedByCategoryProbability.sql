-- @param {String} $1:category
-- @param {Int} $2:offset
-- @param {Int} $3:limit
-- @param {Float} $4:minProbability
-- @param {Float} $5:maxProbability
-- @param {String} $6:domainNameContaining
SELECT d.id
FROM
    domain d
    JOIN classification_category_result r ON d.id = r.domain_id
    JOIN classification_category cat ON r.category_id = cat.id
WHERE
    cat.category = $1
    AND r.probability > $4
    AND r.probability < $5
    AND d.domain_name ILIKE '%' || $6 || '%'
ORDER BY r.probability DESC
OFFSET
    $2
LIMIT $3;