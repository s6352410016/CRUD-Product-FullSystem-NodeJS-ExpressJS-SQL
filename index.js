const express = require('express')
const {body , validationResult} = require('express-validator')
const fileUpload = require('express-fileupload')
const path = require('path')
const conn = require('./db')
const fs = require('fs')
const app = express()

app.use(express.urlencoded({extended:false}))
app.use(express.static(path.join(__dirname , 'public')))

app.set('views' , path.join(__dirname , 'views'))
app.set('view engine' , 'ejs')

app.use(fileUpload())

app.get('/' , (req , res) => {
    conn.query("SELECT * FROM products" , (err , rows) => {
        if(err){
            res.status(500).send(err)
        }else{
            res.render('index' , {
                data: rows
            })
        }
    })
})

app.get('/add' , (req , res) => {
    res.render('add_products' , {
        errMsg: ''
    })
})

app.post('/add' , (req , res) => {
    const {name , price , info} = req.body
    if(req.files === null){
        res.render('add_products' , {
            errMsg: 'Product image is required'
        })
    }else if(name.length === 0){
        res.render('add_products' , {
            errMsg: 'Product name is required'
        })
    }else if(price.length === 0){
        res.render('add_products' , {
            errMsg: 'Product price is required'
        })
    }else if(info.length === 0){
        res.render('add_products' , {
            errMsg: 'Product info is required'
        })
    }else{
        let file = req.files.image
        let fileName;
        let fileExtension = file.mimetype.split('/')[1]
        fileName = new Date().getTime() + '.' + fileExtension
        if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/gif'){
            file.mv(`public/img/${fileName}` , err => {
                if(err){
                    return res.status(500).send(err)
                }else{
                    conn.query("INSERT INTO products (img , name , price , info) VALUES(? , ? , ? , ?)" , [fileName , name , price , info] , err => {
                        if(err){
                            return res.status(500).send(err)
                        }else{
                            res.redirect('/')
                        }
                    })
                }
            })
        }else{
           res.render('add_products' , {
               errMsg: 'Image file extension must be png jpeg gif only.'
           }) 
        } 
    }
})

app.get('/edit/:id' , (req , res) => {
    const id = req.params.id
    conn.query("SELECT * FROM products WHERE id = ?" , [id] , (err , rows) => {
        if(err){
            return res.status(500).send(err)
        }else{
            res.render('edit_products' , {
                data: rows,
                errMsg: ''
            })
        }
    })
})

app.post('/edit/:id' , (req , res) => {
    const id = req.params.id
    const {name , price , info} = req.body

    // ถ้าไม่มีการเลือกรูปภาพ ก็คือใช้รูปเดิม
    if(req.files === null){
        let oldfile = req.body.img
        conn.query("SELECT * FROM products WHERE id = ?" , [id] , (err , rows) => {
            if(err){
                return res.status(500).send(err)
            }else{
                if(name.length === 0){
                    res.render('edit_products' , {
                        errMsg: 'Product name is required',
                        data: rows
                    })
                }else if(price.length === 0){
                    res.render('edit_products' , {
                        errMsg: 'Product price is required',
                        data: rows
                    })
                }else if(info.length === 0){
                    res.render('edit_products' , {
                        errMsg: 'Product info is required',
                        data: rows
                    })
                }else{
                    conn.query("UPDATE products SET img = '" + oldfile + "' , name = '" + name + "' , price = '" + price + "' , info = '" + info + "' WHERE id = '" + id + "' " , err => {
                        if(err){
                            return res.status(500).send(err)
                        }else{
                            res.redirect('/')
                        }
                    })
                }
            }
        })
    }else{
        // ถ้าใช้รูปใหม่
        let file = req.files.image
        let fileName 
        let fileExtension = file.mimetype.split('/')[1]
        fileName = new Date().getTime() + '.' + fileExtension
        
        conn.query("SELECT * FROM products WHERE id = ?" , [id] , (err , rows) => {
            if(err){
                return res.status(500).send(err)
            }else{
                if(name.length === 0){
                    res.render('edit_products' , {
                        errMsg: 'Product name is required',
                        data: rows
                    })
                }else if(price.length === 0){
                    res.render('edit_products' , {
                        errMsg: 'Product price is required',
                        data: rows
                    })
                }else if(info.length === 0){
                    res.render('edit_products' , {
                        errMsg: 'Product info is required',
                        data: rows
                    })
                }else{
                    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/gif'){
                        file.mv(`public/img/${fileName}` , err => {
                            if(err){
                                return res.status(500).send(err)
                            }else{
                                conn.query("UPDATE products SET img = '" + fileName + "' , name = '" + name + "' , price = '" + price + "' , info = '" + info + "' WHERE id = '" + id + "' " , err => {
                                    if(err){
                                        return res.status(500).send(err)
                                    }else{
                                        res.redirect('/')
                                    }
                                })
                            }
                        })
                    }else{
                        res.render('edit_products' , {
                            errMsg: 'Image file extension must be png jpeg gif only.',
                            data: rows
                        })
                    }
                }
            }
        })
    }
})

app.get('/delete/:id' , (req , res) => {
    const id = req.params.id
    conn.query("SELECT img FROM products WHERE id = ?" , [id] , (err , rows) => {
        if(err){
            return res.status(500).send(err)
        }else{
            const img = rows[0].img
            fs.unlink(`public/img/${img}` , err => {
                if(err){
                    return res.status(500).send(err)
                }else{
                    conn.query("DELETE FROM products WHERE id = ?" , [id] , err => {
                        if(err){
                            return res.status(500).send(err)
                        }else{
                            res.redirect('/')
                        }
                    })
                }
            })
        }
    })
})

app.listen(3000 , () => {
    console.log('Server run...')
})