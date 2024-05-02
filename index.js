const express = require('express');
const fs = require('fs');
const cookieSession = require("cookie-session");
const cors = require('cors');
const bcrypt = require("bcrypt");
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());
const port = 3001;
const sessions = [];

let rawdata = fs.readFileSync('data/users.json', {encoding:"utf8"});
const users = JSON.parse(rawdata) ?? [];
rawdata = fs.readFileSync('data/tasks.json', {encoding:"utf8"});
const tasks = JSON.parse(rawdata) ?? [];

function saveData(data, file){
    fs.writeFileSync('data/'+file+'.json', JSON.stringify(data));
}

app.use((req, res, next) => {
    if (req.path === '/login' || req.path === '/register'){
        next();
    }
    else {
        if (req.headers.token){
            console.log(sessions)
            console.log(req.headers.token)
            let session = sessions.find(session => session.token === req.headers.token);
            if (!session) {
                console.log('session not found');
                return res.status(401).json({ status: 'Unauthorized'});
            }

            let now = new Date();
            let expiresAt = new Date(session.expiresAt);
            if(now>= expiresAt) {
                return res.status(401).send('Session expired');
            }

            req.usersession = session;
            next();
        } else {
            console.log('no token');
            res.status(401).json({status: 'Unauthorized'});
        }
    }
})

app.get('/', (req, res) => {
    res.send('')
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
    res.send("deleted user")
    saveData(users, "users")
})




app.get('/tasks', async (req,res)=>{
    const userId = req.usersession.user.id;
    const userTasks = tasks.filter(task => task.userId === userId)
    res.status(200).json({ status: 'OK', tasks: userTasks });
})

app.post('/tasks', (req,res) =>{
    const userId = req.usersession.user.id;

    const task = {
        name : req.body,
        userId: userId,
    }
    task.id = Math.floor(Math.random() * 10000)
    tasks.push(task)
    saveData(tasks, "tasks")
    console.log(userId)
    res.status(200).json({ status: 'OK', task: task });
})

app.get('/tasks/:id', (req,res) =>{
    const task = tasks.find(u => u.id == req.params.id)
    console.log(task)
    if (task) {
        res.status(200).json(task);
    } else {
        res.status(404).json({ status: 'Not Found', message: 'Task not found' });
    }
});

app.put('/tasks/:id', (req,res) =>{
    const {name} = req.body;

    const index = tasks.findIndex(u => u.id == req.params.id)
    tasks[index].name = name;

     console.log(tasks[index], tasks)
     saveData(tasks, "tasks")
     res.status(200).json(tasks[index]);
})

app.delete('/tasks/:id', (req,res)=> {
    const userId = req.usersession.user.id;
    const taskId = req.params.id;

    const index = tasks.findIndex(u => u.id == req.params.id)

    tasks.splice(index, 1)
    saveData(tasks, "tasks")
    res.status(204).end()
})

app.post('/login', async (req,res) =>{
    const { username, password} = req.body;

    const user = await users.find(u => u.username === username);

    let passwordHash = user.password;
    const validPassword = await bcrypt.compare(password, passwordHash)
    if (!validPassword) {
        res.status(400).json({ status: 'Username or password is incorrect' });
        return;
    }
    crypto.randomBytes(64, (err, buffer)=> {
        var token = buffer.toString('hex');
        let session = {
            token: token,
            user: user,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            createdAt: new Date().toISOString(),
            expiresAt: new Date(new Date().getTime() + 1000 * 60 * 60* 24* 1).toISOString()
        };
        console.log(token);
        sessions.push(session);
        console.log(session)
        res.status(200).json({ status: 'Login successful', session : session});
    });
})

app.post('/register', async (req,res) => {
    const {username, password} = req.body;


    if (await users.find(u => u.username === username)){
    return res.status(409).json({ status : "Username already exists"});
    };
    const salt = await bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser ={
        username: req.body.username,
        password: hashedPassword
    } 

    newUser.id = Math.floor(Math.random() * 10000)
    users.push(newUser)
    console.log(newUser);
    res.send(newUser)
    saveData(users, "users")
})


app.get('/logout', (req,res) => {
   req.session.destroy();
    res.redirect('/');
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

