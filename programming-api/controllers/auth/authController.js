//const eta = new Eta({ views: `${Deno.cwd()}/templates/` });
//import * as scrypt from "https://deno.land/x/scrypt@v4.3.4/mod.ts";
import * as userService from "./userService.js";
import * as sessionService from "./sessionService.js";

//const showRegistrationForm = (c) => {
//    return c.html(eta.render("registration.eta"));
//}

//const showLoginForm = (c) => {
//    return c.html(eta.render("login.eta"));
//}

const registerUser = async (c) => {
  const body = await c.req.parseBody();

  if (body.password !== body.verification) {
    return c.text("The provided passwords did not match.");
  }
  const existingUser = await userService.findUserByEmail(body.email);
  if (existingUser) {
    return c.text(`A user with the email ${body.email} already exists.`);
  }

  const user = {
    id: crypto.randomUUID(),
    email: body.email,
    passwordHash: scrypt.hash(body.password),
  };
  console.log("REGISTRATION", user);
  await userService.createUser(user);
  await sessionService.createSession(c, user);
  console.log("DONE", body.email, body.password);
  return c.redirect("/");
};

const loginUser = async (c) => {
  const body = await c.req.parseBody();
  console.log("LOGIN", body);
  const user = await userService.findUserByEmail(body.email);
  if (!user) {
    return c.text(`No user with the email ${body.email} exists.`);
  }
  const passwordsMatch = scrypt.verify(body.password, user.passwordHash);
  if (!passwordsMatch) {
    return c.text("Incorrect password.");
  }
  await sessionService.createSession(c, user);

  console.log("USER ACCOUNT", user);
  //return c.text(JSON.stringify(user));
  return c.redirect("/");
};

const logoutUser = async (c) => {
  await sessionService.deleteSession(c);
  return c.redirect("/");
};

const getAllUsers = async (c) => {
  const users = await userService.getAllUsers();
  return c.text(users);
};

export { loginUser, logoutUser, registerUser };
