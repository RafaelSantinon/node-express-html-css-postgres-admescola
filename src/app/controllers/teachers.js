const teacher = require("../models/Teachers")
const {graduation, age, date} = require("../../lib/utils")

module.exports= {
    index(req, res){
        let {filter, page, limit} = req.query

        page = page || 1
        limit = limit || 2
        let offset = limit * (page - 1)

        const params = {
            filter,
            page,
            limit,
            offset,
            callback(teachers) {
                const pagination = {
                    total: Math.ceil(teachers[0].total / limit),
                    page
                }
                return res.render("teachers/index", {teachers, filter, pagination})
            }
        }

        teacher.paginate(params)
    },
    show(req, res){
        teacher.find(req.params.id, function(teacher){
            if(!teacher) return res.send("Teacher not found!")

            teacher.age = age(teacher.birth)
            teacher.education_level = graduation(teacher.degrees)
            teacher.subjects_taught = teacher.areas.split(",")
            teacher.created_at = date(teacher.created_at).format

            return res.render("teachers/show", {teacher})
        })
    },
    create(req, res){
        res.render("teachers/create")
    },
    post(req, res){
        const keys = Object.keys(req.body)

        for(key of keys){
            if(req.body[key] == ""){
                return res.send("Please, fill in all fields")
            }
        }

        teacher.create(req.body, function(teacher){
            return res.redirect(`/teachers/${teacher.id}`)
        })
    },
    edit(req, res){
        teacher.find(req.params.id, function(teacher) {
            if(!teacher) return res.send("Teacher not found")

            teacher.birth = date(teacher.birth).iso

            return res.send("teachers/edit", {teacher})
        })
    },
    put(req, res){
        const keys = Object.keys(req.body)

        for(key of keys){
            if(req.body[key] == ""){
                return res.send("Please, fill in all fields")
            }
        }

        teacher.updated(req.body, function(){
            return res.redirect(`/teachers/${req.body.id}`)
        })
    },
    delete(req, res){
        teacher.delete(req.body.id, function() {
            return res.redirect("/teachers")
        })
    }
}