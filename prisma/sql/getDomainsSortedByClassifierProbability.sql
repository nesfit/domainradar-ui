-- @param {String} $1:category
-- @param {Int} $2:offset
-- @param {Int} $3:limit
SELECT d.id
FROM
    domain d
    JOIN classification_category_result r ON d.id = r.domain_id
    JOIN classification_category cat ON r.category_id = cat.id
WHERE
    cat.category = $1
GROUP BY
    d.id
ORDER BY MAX(r.probability) DESC -- or use AVG(r.score) if you prefer
OFFSET
    $2
LIMIT $3;