const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const { body, validationResult, check } = require('express-validator')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')
const { loadContacts, findContact, addContact, cekDuplicate, deleteContact, updateContacts } = require('./utils/contact')

const app = express()
const port = 3000

app.set('view engine', 'ejs')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser('secret'))
app.use(session({
    cookie: { maxAge: 6000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))
app.use(flash())

app.get('/', (req, res) => {
    const mahasiswa = [
        {
            nama: 'Fathor Rohman',
            email: 'onkz@gmail',
        },
        {
            nama: 'Onkz',
            email: 'onkz@gmail',
        },
        {
            nama: 'Zafran',
            email: 'onkz@gmail',
        }
    ]
    res.render('home', {
        title: 'Home',
        layout: 'layout/mainlayout',
        mahasiswa
    })
})
app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About',
        layout: 'layout/mainlayout'
    })
})
app.get('/contact', (req, res) => {
    const contacts = loadContacts()
    res.render('contact', {
        title: 'Contact',
        layout: 'layout/mainlayout',
        contacts,
        msg: req.flash('msg')
    })
})

app.get('/contact/add', (req, res) => {
    res.render('add-contact', {
        title: 'Form Add Contact',
        layout: 'layout/mainlayout',
    })
})

app.post('/contact',
    [
        body('nama').custom((value) => {
            const duplicate = cekDuplicate(value)
            if (duplicate) {
                throw new Error('Contact sudah terdaftar !')
            }
            return true
        }),
        check('email', 'Email Tidak Valid').isEmail(),
        check('noHP', 'No HP Tidak Valid').isMobilePhone('id-ID')
    ],
    (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            // return res.status(400).json({ errors: errors.array() })
            res.render('add-contact', {
                title: 'Form Add Contact',
                layout: 'layout/mainlayout',
                errors: errors.array()
            })
        } else {
            addContact(req.body)
            req.flash('msg', 'Data contact berhasil ditambahkan !')
            res.redirect('/contact')
        }
    }
)

app.get('/contact/delete/:nama', (req, res) => {
    const contact = findContact(req.params.nama)
    if (!contact) {
        res.status(404)
        res.send('Contact Not Found !')
    } else {
        deleteContact(req.params.nama)
        req.flash('msg', 'Data contact berhasil dihapus !')
        res.redirect('/contact')
    }
})

app.get('/contact/edit/:nama', (req, res) => {
    const contact = findContact(req.params.nama)
    if (!contact) {
        res.status(404)
        res.send('Contact Not Found !')
    } else {
        res.render('edit-contact', {
            title: 'Form Update Contact',
            layout: 'layout/mainlayout',
            contact,
        })
    }
})

app.post('/contact/edit',
    [
        body('nama').custom((value, { req }) => {
            const duplicate = cekDuplicate(value)
            if (duplicate && value !== req.body.oldNama) {
                throw new Error('Contact sudah terdaftar !')
            }
            return true
        }),
        check('email', 'Email Tidak Valid').isEmail(),
        check('noHP', 'No HP Tidak Valid').isMobilePhone('id-ID')
    ],
    (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.render('edit-contact', {
                title: 'Form Update Contact',
                layout: 'layout/mainlayout',
                errors: errors.array(),
                contact: req.body
            })
        } else {
            // res.send(req.body)
            updateContacts(req.body)
            req.flash('msg', 'Data contact berhasil Diubah !')
            res.redirect('/contact')
        }
    }
)

app.get('/contact/:nama', (req, res) => {
    const contact = findContact(req.params.nama)
    res.render('detail', {
        title: 'Detail Contact',
        layout: 'layout/mainlayout',
        contact,
    })
})

app.use('/', (req, res) => {
    res.status(404).send('Not Found !')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})