import UserSchema from '../model/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ENV from '../config.js';
import otpGenerator from 'otp-generator';

export async function verifyUser(req, res, next) {
  try {
    const { username } = req.method === 'GET' ? req.query : req.body;

    let exist = await UserSchema.findOne({ username });

    if (!exist) {
      return res.status(500).send({ error: 'Invalid Username' });
    }
    next();
  } catch (error) {
    return res.status(500).send(error);
  }
}

export async function register(req, res) {
  try {
    const { username, password, profile, email } = req.body;

    const existUsername = await UserSchema.findOne({
      username: req.body.username,
    });
    if (existUsername) {
      console.log('Username Taken');
    }

    const existEmail = await UserSchema.findOne({ email: req.body.email });
    if (existEmail) {
      console.log('Email already exist');
    }

    // Promise.all([existUsername, existEmail])
    //   .then(() => {
    // if (req.body.password) {
    bcrypt
      .hash(req.body.password, 10)
      .then(hashedPassword => {
        const user = new UserSchema({
          username: req.body.username,
          password: hashedPassword,
          profile: profile || '',
          email: req.body.email,
        });

        user
          .save()
          .then(result => res.status(201).send({ msg: 'registered', result }))
          .catch(error => res.status(500).send(error));
      })
      .catch(error => {
        return res.status(500).send({ msg: 'Enable hashed Password', error });
      });
    // }
    //   })
    //   .catch(error => {
    //     return res.status(500).send(error);
    //   });
  } catch (error) {
    return res.status(500).send(error);
  }
}

export async function login(req, res) {
  const { username, password } = req.body;
  try {
    UserSchema.findOne({ username })
      .then(user => {
        bcrypt
          .compare(password, user.password)
          .then(passwordCheck => {
            if (!passwordCheck) {
              return res.status(500).send({ error: 'Invalid Password' });
            }

            const token = jwt.sign(
              {
                userId: user._id,
                username: user.username,
              },
              ENV.JWT_SECRET,
              { expiresIn: '24hr' }
            );
            return res.status(201).send({
              msg: 'Login Successful',
              username: user.username,
              token,
            });
          })
          .catch(error => {
            return res.status(500).send(error);
          });
      })
      .catch(error => {
        return res.status(500).send(error);
      });
  } catch (error) {
    return res.status(500).send(error);
  }
}

export async function getUser(req, res) {
  const { username } = req.params;

  try {
    if (!username) {
      return res.status(501).send({ error: 'Invalid Username' });
    }

    UserSchema.findOne({ username })
      .then(user => {
        const { password, ...rest } = Object.assign({}, user.toJSON());

        return res.status(201).send(rest);
      })
      .catch({ error: 'User not found' });

    // UserSchema.finOne({ username }, function (err, user) {
    //   if (err) return res.status(500).send({ err });
    //   if (!user) return res.status(501).send({ error: 'Invalid Username' });

    //   return res.status(201).send(user);
    // });
  } catch (error) {
    return res.status(404).send({ error: 'Cannot find user data' });
  }
}

export async function updateUser(req, res) {
  try {
    // const id = req.query.id;
    const { userId } = req.user;

    if (userId) {
      const body = req.body;
      UserSchema.updateOne({ _id: userId }, body)
        .then(data => {
          return res.status(201).send({ msg: 'Updated' });
        })
        .catch(err => {
          res.status(500).send(err);
        });
    } else {
      return res.status(500).send({ error: 'User not Found' });
    }
  } catch (error) {
    res.status(500).send(error);
  }
}

export async function generateOtp(req, res) {
  req.app.locals.OTP = await otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  res.status(201).send({ code: req.app.locals.OTP });
}

export async function verifyOtp(req, res) {
  const { code } = req.query;
  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    req.app.locals.OTP = null;
    req.app.locals.resetSession = true;
    return res.status(201).send({ msg: 'success' });
  }
  return res.status(400).send({ error: 'Invalid OTP' });
}

export async function createResetSession(req, res) {
  if (req.app.locals.resetSession) {
    req.app.locals.resetSession = false;
    return res.status(201).send({ msg: 'access granted' });
  }
  return res.status(440).send({ error: 'Session expired' });
}

export async function resetPassword(req, res) {
  try {
    if (!req.app.locals.resetSession)
      return res.status(440).send({ error: 'session expired' });

    const { username, password } = req.body;

    try {
      UserSchema.findOne({ username })
        .then(user => {
          bcrypt
            .hash(password, 10)
            .then(hashedPassword => {
              UserSchema.updateOne(
                { username: user.username },
                { password: hashedPassword }
              )
                .then(data => {
                  req.app.locals.resetSession = false;
                  return res.status(201).send({ msg: 'Password updated' });
                })
                .catch(err => {
                  return res.status(500).send(err);
                });
            })
            .catch(err => {
              return res.status(500).send({ error: 'Enable to hash password' });
            });
        })
        .catch(err => {
          return res.status(401).send({ error: 'Username not found' });
        });
    } catch (error) {
      return res.status(500).send(error);
    }
  } catch (error) {
    return res.status(401).send(error);
  }
}
