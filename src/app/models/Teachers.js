
const db = require("../../config/db")

module.exports = {
    all(callback) {
        db.query(`
        SELECT teachers.*, count(students) AS total_students
        FROM teachers
        LEFT JOIN students ON (teachers.id = students.teacher_id)
        GROUP BY total_students ASC`, function(err, results){
            if(err) throw `Database error! ${err}`

            callback(results.rows)
        })
    },
    create(data, callback) {
        const query = `
        INSERT INTO teachers (
            avatar_url,
            name,
            birth_date,
            education_level,
            class_type,
            subjects_taught,
            created_at
        )VALUES($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
    `

    const values = [
        data.avatar_url,
        data.name,
        date(data.birth),
        data.degress,
        data.class_type,
        data.areas,
        date(Date.now()).iso
    ]

    db.query(query, values, function(err, results) {
        if(err) throw `Database error ${err}`

        callback(results.rows[0])
    })
    },
    find(id, callback) {
        db.query(`
            SELECT *
            FROM teacher
            WHERE id = $1`, [id], function(err, results) {
                if(err) throw `Database error ${err}`

                callback(results.rows[0])
            })
    },
    findBy(filter, callback){
        db.query(`
        SELECT teachers.*, count(students) AS total_students 
        FROM teachers
        LEFT JOIN students ON (teachers.id = students.teacher_id)
        WHERE teachers.name ILIKE '%${filter}%'
        OR teachers.services ILIKE '%${filter}%'
        GROUP BY teachers.id
        ORDER BY total_students DESC`, function(err, results){
            if(err) throw `Database error! ${err}`

            callback(results.rows)
    }) 
    },
    updated(data, callback) {
        const query = `
        UPDATE teacher SET
            avatar_url=($1),
            name=($2),
            birth_date=($3),
            education_level=($4),
            class_type=($5),
            subjects_taught=($6)
        WHERE id = $7`

        const values =[
            data.avatar_url,
            data.name,
            date(data.birth).iso,
            data.degress,
            data.class_type,
            data.areas,
            data.id
        ]

        db.query(query, values, function(err, results) {
            if(err) throw `DATAbase error ${err}`

            callback()
        })
    },
    delete(id, callback) {
        db.query(`DELETE FROM teacher WHERE id = $1`, [id], function(err, results) {
            if(err) throw `DATAbase error ${err}`

            callback()
        })
    },
    paginate(params){
        const {filter, limit, offset, callback} = params


        let query = "",
            queryFilter = "",
            totalQuery = `(
                SELECT count (*) FROM teachers            
            ) AS total`

        if (filter){

            queryFilter = `${query}
            WHERE teachers.name ILIKE '%${filter}%'
            OR teachers.education_level ILIKE '%${filter}%'
            `

            totalQuery = `(
                SELECT count(*) FROM teachers
                ${queryFilter}
            ) AS total`
        }

        query = `
        SELECT teachers.*, ${totalQuery} , count (students) AS total_students 
        FROM teachers
        LEFT JOIN students ON (teachers.id = students.teacher_id)
        ${queryFilter}
        GROUP BY teachers.id LIMIT $1 OFFSET $2
        `
        db.query(query, [limit, offset], function(err, results){
            if (err) throw `Database Error ${err}`

            callback(results.rows)
        })
    }
}