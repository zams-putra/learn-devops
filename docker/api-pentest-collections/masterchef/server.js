import Database from "better-sqlite3";
import express from "express";
import session from "express-session";

const app = express();

const db = Database('data.db')


app.use(express.json());

app.use(
  session({
    secret: "keyboard-cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

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


app.get("/api", (req, res) => {
  res.status(200).json([
    {
      name: "public",
      status: 200,
      message: "login dulu lah cuy ke endpoint login, noh endpoints method http nya cari sendiri males gw",
      endpoints: [
        {
          name: "/api",
          desc: "gatau, serah lu dah"
        },
        {
          name: "/api/register",
          desc: "buat register lah cuy"
        },
        {
          name: "/api/login",
          desc: "buat login lah cuy"
        },
        {
          name: "/api/logout",
          desc: "buat logout. bisa baca ga ?"
        },
      ]
    },
    {
      name: "Authenticated",
      status: 200,
      message: "login dulu lah cuy ke endpoint login, noh endpoints method http nya cari sendiri males gw",
      endpoints: [
        {
          name: "/api/dashboard",
          desc: "ya dashboard lah apalagi"
        },
        {
          name: "/api/recipes",
          desc: "ya buat resep gimana sih"
        },
        {
          name: "/api/profile",
          desc: "ya buat profile"
        },
        {
          name: "/api/profile/:id",
          desc: "serah lu"
        },
      ]
    },
  ]);
});

app.get("/api/register", (req, res) => {
   res.status(200).json({
    status: 200,
    message: "ya ya ya nih data require nya",
    required: {
      username: "terserah",
      password: "hoaaammm",
    }
  });
})

app.post("/api/register", (req, res) => {
  const {username, password} = req.body

  if(!username || !password) {
    return res.status(400).json({
      status: 400,
      message: "username and pass required yaela di isi lah"
    })
  }


  try {
    db.prepare(`
      INSERT INTO users(username,password,role) VALUES(?,?,?)
      `).run(username, password, "user")

      res.status(201).json({
        status: 201,
        message: "register success ya ya ya sana masuk"
      })
  } catch {
    res.status(409).json({
        status: 409,
        message: "username dah ada"
      })
  }
  
})

app.get("/api/login", (req, res) => {
  res.status(200).json({
    status: 200,
    message: "ya ya ya nih data require nya",
    required: {
      username: "terserah",
      password: "hoaaammm",
    }
  });
});


app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  

  const user = db.prepare(
    `SELECT * FROM users WHERE username = ? AND password = ?`
  ).get(username, password)
  

  if (!user) {
    return res.status(401).json({
        status: 401,
        message: "Invalid creds, bubar.",
    });
  }

  req.session.orang = {
    id: user.id,
    username: user.username,
    role: user.role,
  };

  res.status(200).json({
    status: 200,
    message: "login success",
  });
});

app.get("/api/dashboard", mustBeUser, (req, res) => {
  res.status(200).json({
    status: 200,
    message: `welcome to the dashboard, chef ${req.session.orang.username}`,
  })
});


app.get("/api/profile", mustBeUser, (req, res) => {
  res.status(200).json({
    status: 200,
    data: req.session.orang,
    redirect: `/api/profile/${req.session.orang.id}`,
    requiredEditProfilePatch: {
      username:"serah mau edit apa",
    }
  })
}

)

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


app.get("/api/recipes", mustBeUser, (req, res) => {
  res.status(200).json({
    status: 200,
    message: "inilah dia",
    data: [
      {
        id: 1,
        name: "Nasgor",
        description: "1kg nasi, 2kg ayam, 8 butir telur",
      },
      {
        id: 2,
        name: "Mie goreng",
        description: "1kg mie, 2kg ayam, 8 butir telur",
      },
      {
        id: 3,
        name: "Bubur ayam",
        description: "1kg ikan, 2kg ayam, 8 butir telur",
      },
      {
        id: 4,
        name: "/secret",
        description: "HAHAHAHAHA KASIANNN GABISA AKSES HAHAHAHA",
      },
    ],
  })
});


app.get("/api/recipes/secret", mustBeUser, mustBeChef, (req, res) => {
   res.status(200).json({
    status: 200,
    flag: "89eb6f417dae7a311b2cb8c5f9eff883"
  })
})

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.status(200).json({
        status: 200,
        message: "Logout done kelar",
    });
  });
});

app.listen(5000, () => console.log("server started on http://localhost:5000"));
