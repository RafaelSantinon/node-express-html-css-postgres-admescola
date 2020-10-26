const {date} = require("../../lib/utils")
const db = require("../../config/db")

module.exports = {
    all(callback) {
        db.query(`
        SELECT *
        FROM students
        ORDER BY name ASC`, function(err, results){
            if(err) throw `Database error! ${err}`

            callback(results.rows)
        })
    },
    create(data, callback) {
        const query = `
        INSERT INTO students (
            avatar_url,
            name,
            birth_date,
            email,
            year,
            hours,
            created_at
        )VALUES($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
    `

    const values = [
        data.avatar_url,
        data.name,
        date(data.birth),
        data.email,
        data,year,
        data.hours,
        date(Date.now()).iso
    ]

    db.query(query, values, function(err, results) {
        if(err) throw `Database error ${err}`

        callback(results.rows[0])
    })
    },
    find(id, callback) {
        db.query(`
            SELECT students.*, teachers.name AS teacher_name
            FROM students
            LEFT JOIN teachers ON (students.teacher_id = teachers.id)
            WHERE student.id = $1`, [id], function(err, results) {
                if(err) throw `Database error ${err}`

                callback(results.rows[0])
            })
    },
    updated(data, callback) {
        const query = `
        UPDATE students SET
            avatar_url=($1),
            name=($2),
            birth_date=($3),
            email=($4),
            year($5),
            hours=($6)
        WHERE id = $7`

        const values =[
            data.avatar_url,
            data.name,
            date(data.birth).iso,
            data.email,
            data.year,
            data.hours,
            data.id
        ]

        db.query(query, values, function(err, results) {
            if(err) throw `DATAbase error ${err}`

            callback()
        })
    },
    delete(id, callback) {
        db.query(`DELETE FROM students WHERE id = $1`, [id], function(err, results) {
            if(err) throw `DATAbase error ${err}`

            callback()
        })
    },
    teacherSelectOptions(callback){
        db.query(`SELECT name, id FROM students`, function(err, results){
            if(err) throw "Database error!"

            callback(results.rows)
        })
    },
    paginate(params){
        const {filter, limit, offset, callback} = params


        let query = "",
            queryFilter = "",
            totalQuery = `(
                SELECT count (*) FROM students            
            ) AS total`

        if (filter){

            queryFilter = `${query}
            WHERE students.name ILIKE '%${filter}%'
            OR students.email ILIKE '%${filter}%'
            `

            totalQuery = `(
                SELECT count(*) FROM students
                ${queryFilter}
            ) AS total`
        }

        query = `
        SELECT students.*, ${totalQuery}
        FROM students
        ${queryFilter}
        LIMIT $1 OFFSET $2
        `
        db.query(query, [limit, offset], function(err, results){
            if (err) throw `Database Error ${err}`

            callback(results.rows)
        })
    }
}