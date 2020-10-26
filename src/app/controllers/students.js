const student = require("../models/Students")
const {date, schollYear} = require("../../lib/utils")

module.exports = {

    index(req, res) {
        let {filter, page, limit} = req.query

        page = page || 1
        limit = limit || 2
        let offset = limit * (page - 1)

        const params = {
            filter,
            page,
            limit,
            offset,
            callback(students) {
                const pagination = {
                    total: Math.ceil(students[0].total / limit),
                    page
                }
                return res.render("students/index", {students, filter, pagination})
            }
        }

        student.paginate(params)
    },
    show(req, res) {
        student.find(req.params.id, function(student){
            if(!student) return res.send("Student not found!")

            student.birth = date(student.birth).birthDay
            student.year = schollYear(student.year)

            return res.render("students/show", {student})
        })
    },
    create(req, res) {
        student.teacherSelectOptions(function(options){
            return res.render("students/create", {teacherOptions: options})
        })  
    },
    post(req, res) {
        const keys = Object.keys(req.body)

        for(key of keys){
            if(req.body[key] == ""){
                return res.send("Please, fill in all fields")
            }
        }

        student.create(req.body, function(student){
            return res.redirect(`/students/${student.id}`)
        })
    },
    edit(req, res) {
        student.find(req.params.id, function(student) {
            if(!student) return res.send("Student not found")

            student.birth = date(student.birth).iso

            student.teacherSelectOptions(function(options){
                return res.render("students/edit", {student, teacherOptions: options})
            })  
        })
    },
    put(req, res) {
        const keys = Object.keys(req.body)

        for(key of keys){
            if(req.body[key] == ""){
                return res.send("Please, fill in all fields")
            }
        }

        student.create(req.body, function(student){
            return res.redirect(`/students/${student.id}`)
        })
    },
    delete(req, res) {
        student.delete(req.body.id, function() {
            return res.redirect("/students")
        })
}
}