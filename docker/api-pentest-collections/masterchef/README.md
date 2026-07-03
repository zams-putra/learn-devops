# 1 - MasterChef
- middleware 
```js
const mustBeUser = (req, res, next) => {
  const user = req.session.orang;
  if (!user) return res.json({
      status: 401,
      message: "Login required, lau sape mpruy",
  })
  next();
};

const mustBeChef = (req, res, next) => {
  const user = req.session.orang;
  if (user.role !== "masterchef") return res.json({
      status: 401,
      message: "Unauthorized sana pergi",
  });
  next();
};
```

## BOLA 
- code disini 
```js
app.get("/api/profile/:id", mustBeUser, (req, res) => {
  const user = db.prepare(`
    SELECT id,username,role FROM users WHERE id = ?
    `).get(req.params.id)

  if(!user){
    return res.status(404).json({
      status: 404,
      message: "nyari siapa sih?"
    })
  }
  res.status(200).json({
    status: 200,
    data: user
  })
})
```


## BFLA 
- code disini 
```js
app.patch("/api/profile", mustBeUser, (req, res) => {
  const username = req.body.username ?? req.session.orang.username;
  const role = req.body.role ?? req.session.orang.role;

  db.prepare(`
    UPDATE users SET username = ?, role = ? WHERE id = ?
    `).run(username,role,req.session.orang.id)
    req.session.orang.username = username
    req.session.orang.role = role

    res.status(200).json({
      status: 200,
      message: "profile updated dah sono pergi"
    })
})
```