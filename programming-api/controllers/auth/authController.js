//const eta = new Eta({ views: `${Deno.cwd()}/templates/` });
import * as scrypt from "https://deno.land/x/scrypt@v4.3.4/mod.ts";
import * as userService from "../../services/auth/userService.js";
import * as sessionService from "../../services/auth/sessionService.js";

//todo : Zod validation

//const showRegistrationForm = (c) => {
//    return c.html(eta.render("registration.eta"));
//}

//const showLoginForm = (c) => {
//    return c.html(eta.render("login.eta"));
//}

const registerUser = async (c) => {
  const body = await c.req.json();
  console.log("REGISTRATION", body);

  if (body.password !== body.verification) {
    return c.text("The provided passwords did not match.");
  }
  const existingUser = await userService.findUserByEmail(body.email);
  if (existingUser.userid) {
    console.log("EXISTING USER", existingUser);
    return c.text(`A user with the email ${body.email} already exists.`);
  }

  const user = {
    userid: crypto.randomUUID(),
    email: body.email,
    passwordHash: scrypt.hash(body.password),
  };
  console.log("REGISTRATION", user);
  await userService.createUser(user);
  await sessionService.createSession(c, user);
  console.log("DONE", body.email, body.password);
  return c.json(
    { message: "User created successfully.", user: user.email },
    201,
  );
};

const loginUser = async (c) => {
  const body = await c.req.json();
  console.log("LOGIN", body);
  const user = await userService.findUserByEmail(body.email);
  if (!user) {
    return c.text(`No user with the email ${body.email} exists.`);
  }
  console.log("USER", user);
  const passwordsMatch = scrypt.verify(body.password, user.password_hash);
  if (!passwordsMatch) {
    return c.json({ message: "User authentication failed." }, 401);
  }
  await sessionService.createSession(c, user);

  console.log("USER ACCOUNT", user);
  //return c.text(JSON.stringify(user));
  return c.json(
    { message: "User authenticated successfully.", user: user.email },
    200,
  );
};

const logoutUser = async (c) => {
  await sessionService.deleteSession(c);
  return c.json({ message: "User logged out successfully." }, 200);
};

const getAllUsers = async (c) => {
  const users = await userService.getAllUsers();
  return c.text(users);
};

export { loginUser, logoutUser, registerUser };
