const express = require('express');
const fs = require('fs');
const cookieSession = require("cookie-session");
const cors = require('cors');

const app = express()
app.use(express.json())
app.use(cors())
const port = 3001

app.use(cookieSession({
    name: '',
    keys: '123',
    maxAge: 24*60*60*1000
}))

let rawdata = fs.readFileSync('data/users.json', {encoding:"utf8"});
const users = JSON.parse(rawdata) ?? [];
rawdata = fs.readFileSync('data/tasks.json', {encoding:"utf8"});
const tasks = JSON.parse(rawdata) ?? [];

function saveData(data, file){
    fs.writeFileSync('data/'+file+'.json', JSON.stringify(data));
}



app.get('/', (req, res) => {
    res.send("hi")
})

app.get('/users', (req,res) =>{
    res.send(users)
})

app.post('/users', (req,res) =>{
    const user = req.body
    user.id = Math.floor(Math.random() * 10000)
    users.push(user)
    res.send(user)
    saveData(users, "users")
})

app.get('/users/:id', (req,res) =>{
    const user = users.find(u => u.id == req.params.id)
    console.log(user)
    res.send(user)
})

app.put('/users/:id', (req,res) =>{
    const index = users.findIndex(u => u.id == req.params.id)
    let updatedUser = {
        ...users[index],
        ...req.body
    };
     users[index] = updatedUser
     res.send(users[index])
     saveData(users, "users")
})

app.delete('/users/:id', (req,res)=> {
    const index = users.findIndex(u => u.id == req.params.id)
    users.splice(index, 1)
    res.send("(╯°□°）╯︵ ┻━┻")
    saveData(users, "users")
})


app.get('/tasks', (req,res)=>{
    res.send(tasks)
})

app.post('/tasks', (req,res) =>{
    const task = req.body
    task.id = Math.floor(Math.random() * 10000)
    tasks.push(task)
    res.send(task)
    saveData(tasks, "tasks")
})

app.get('/tasks/:id', (req,res) =>{
    const task = tasks.find(u => u.id == req.params.id)
    console.log(task)
    res.send(task)
})

app.put('/tasks/:id', (req,res) =>{
    const index = tasks.findIndex(u => u.id == req.params.id)
    let updatedTask = {
        ...tasks[index],
        ...req.body
    };
     tasks[index] = updatedTask
     console.log(updatedTask, tasks)
     res.send(tasks[index])
     saveData(tasks, "tasks")
})

app.delete('/tasks/:id', (req,res)=> {
    const index = tasks.findIndex(u => u.id == req.params.id)
    tasks.splice(index, 1)
    res.status(204).end()
    saveData(tasks, "tasks")
})

app.get('/login', (req,res) =>{
    //if(req.body.email == users.email && req.body.password == users.password){
      //  session=req.session;
    //}
})

app.get('/logout', (req,res) => {
   // req.session.destroy();
    //res.redirect('/');
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

