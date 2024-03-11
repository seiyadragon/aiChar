import { action, cache, redirect } from "@solidjs/router";
import { db } from "./db";
import { getSession, login, logout as logoutSession, register, validatePassword, validateUsername } from "./server";
import { CharacterEvent, CharacterTrait } from "./types";
import crypto from "crypto";

export const getRandomUUID = action(async () => {
  "use server";

  return crypto.randomUUID();
});

export const getUser = cache(async () => {
  "use server";
  try {
    const session = await getSession();
    const userId = session.data.userId;
    if (userId === undefined) throw new Error("User not found");
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");
    return { id: user.id, username: user.username };
  } catch {
    await logoutSession();
    throw redirect("/login");
  }
}, "user");

export const loginOrRegister = action(async (formData: FormData) => {
  "use server";
  const username = String(formData.get("username"));
  const password = String(formData.get("password"));
  const loginType = String(formData.get("loginType"));
  let error = validateUsername(username) || validatePassword(password);
  if (error) return new Error(error);

  try {
    const user = await (loginType !== "login"
      ? register(username, password)
      : login(username, password));
    const session = await getSession();
    await session.update(d => (d.userId = user!.id));
  } catch (err) {
    return err as Error;
  }
  return redirect("/dashboard");
});

export const logout = action(async () => {
  "use server";
  await logoutSession();
  return redirect("/login");
});

export const getCharacters = cache(async () => {
  "use server";
  const session = await getSession();
  const userId = session.data.userId;
  if (userId === undefined) throw new Error("User not found");
  return await db.character.findUser({ where: { userID: userId } });
}, "character");

export const createCharacter = action(async (formData: FormData) => {
  "use server";

  const session = await getSession();
  const userId = session.data.userId;
  if (userId === undefined) throw new Error("User not found");

  const firstName = String(formData.get("firstName"));
  const middleName = String(formData.get("middleName"));
  const lastName = String(formData.get("lastName"));

  return await db.character.create({ data: { firstName, middleName, lastName, userID: userId } });
});

export const updateCharacter = action(async (formData: FormData) => {
  "use server";

  const session = await getSession();
  const userId = session.data.userId;
  if (userId === undefined) throw new Error("User not found");

  const id = String(formData.get("cid"));
  const firstName = String(formData.get("firstName"));
  const middleName = String(formData.get("middleName"));
  const lastName = String(formData.get("lastName"));
  const age = Number(formData.get("age"));
  const species = String(formData.get("species"));
  const birthdate = String(formData.get("birthdate"));
  const birthplace = String(formData.get("birthplace"));
  const backstory = String(formData.get("backstory"));
  //const traits = String(formData.get("traits")).split(","); 
  //const events = String(formData.get("events")).split(",");
  let image = String(formData.get("image"));

  return await db.character.update({ where: { id, userID: userId}, data: { 
    firstName, 
    middleName, 
    lastName, 
    age, 
    species,
    birthdate,
    birthplace,
    backstory, 
    image 
  }});
});

export const deleteCharacter = action(async (id: string) => {
  "use server";

  const session = await getSession();
  const userId = session.data.userId;
  if (userId === undefined) throw new Error("User not found");

  await db.character.delete({ where: { id, userID: userId } });
});

export const getProfileImages = cache(async () => {
  "use server";

  const session = await getSession();
  const userId = session.data.userId;
  if (userId === undefined) throw new Error("User not found");

  return await db.image.findUser({ where: { userID: userId } });
}, "profileImage");

export const createProfileImage = action(async (image: string) => {
  "use server";

  const session = await getSession();
  const userId = session.data.userId;
  if (userId === undefined) throw new Error("User not found");

  return await db.image.create({ data: { userID: userId, image } });
});

export const deleteProfileImage = action(async (id: string) => {
  "use server";

  const session = await getSession();
  const userId = session.data.userId;
  if (userId === undefined) throw new Error("User not found");

  await db.image.delete({ where: { id, userID: userId } });
});

export const updateCharacterTraits = action(async (id: string, traits: CharacterTrait[]) => {
  "use server";

  const session = await getSession();
  const userId = session.data.userId;

  if (userId === undefined) throw new Error("User not found");

  return await db.character.update({ where: { id, userID: userId }, data: { traits: traits } });
});

export const updateCharacterEvents = action(async (id: string, events: CharacterEvent[]) => {
  "use server";

  const session = await getSession();
  const userId = session.data.userId;

  if (userId === undefined) throw new Error("User not found");

  return await db.character.update({ where: { id, userID: userId }, data: { events: events } });
});