import { createStorage } from "unstorage";
import fsLiteDriver from "unstorage/drivers/fs-lite";

import crypto from "crypto";

import { User, Character, ProfileImage, UserSettings } from "./types";

const storage = createStorage({
  driver: fsLiteDriver({
    base: "./.data"
  })
});

let currentUsers = await storage.getItem("users:data");
let currentCounter = await storage.getItem("users:counter");

storage.setItem("users:data", currentUsers ?? []);
storage.setItem("users:counter", currentCounter ?? 0);

let currentCharacters = await storage.getItem("characters:data");
let characterProfiles = await storage.getItem("characters:images");

storage.setItem("characters:data", currentCharacters ?? []);
storage.setItem("characters:images", characterProfiles ?? []);

export function genRandomID() {
  return crypto.randomUUID();
}

export const db = {
  user: {
    async create({ data }: { data: { username: string; password: string } }) {
      const [{ value: users }, { value: index }] = await storage.getItems(["users:data", "users:counter"]);
      let user = { ...data, id: genRandomID(), settings: { savePageData: false }};

      await Promise.all([
        storage.setItem("users:data", [...(users as User[]), user]),
        storage.setItem("users:counter", index as number + 1)
      ]);
      return user;
    },
    async findUnique({ where: { username = undefined, id = undefined } }: { where: { username?: string; id?: string } }) {
      let users = await storage.getItem("users:data") as User[];

      let loadAttempts = 0;
      while (!Array.isArray(users)) {
        users = await storage.getItem("users:data") as User[];
        loadAttempts++;

        if (loadAttempts > 100) throw new Error("Failed to load users");
      }

      if (id !== undefined) {
        return users.find(user => user.id === id);
      } else {
        return users.find(user => user.username === username);
      }
    },
    async update({ where: { id = undefined }, data }: { where: { id?: string }, data: Partial<User> }) {
      let users = await storage.getItem("users:data") as User[];
      let user = users.find(user => user.id === id);
      while (!Array.isArray(users)) {
        users = await storage.getItem("users:data") as User[];
      }

      if (user) {
        Object.assign(user, data);

        users.splice(users.findIndex(user => user.id === id), 1, user);

        await storage.setItem("users:data", users);
      }
    }
  },
  character: {
    async create({ data }: { data: {firstName: string, middleName: string, lastName: string, userID: string} }) {
      const [{ value: characters }] = await storage.getItems(["characters:data", "characters:counter"]);

      let character = { 
        id: genRandomID(),
        userID: data.userID,
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        age: 0,
        species: "Human",
        birthdate: Date.now().toString(),
        birthplace: "Earth",
        backstory: "",
        traits: [],
        events: [],
        image: "",
      };

      await Promise.all([
        storage.setItem("characters:data", [...(characters as Character[]), character])
      ]);
      return character;
    },
    async findAll() {
      return (await storage.getItem("characters:data")) as Character[];
    },
    async findUser({ where: { userID = undefined } }: { where: { userID?: string }}) {
      let characters = (await storage.getItem("characters:data")) as Character[];

      let loadAttempts = 0;
      while (!Array.isArray(characters)) {
        characters = (await storage.getItem("characters:data")) as Character[];
        loadAttempts++;

        if (loadAttempts > 100) throw new Error("Failed to load characters");
      }

      if (characters === undefined) return [] as Character[];

      return characters.filter(character => character.userID === userID);
    },
    async findUnique({ where: { id = undefined } }: { where: { id?: string } }) {
      let characters = (await storage.getItem("characters:data")) as Character[];

      let loadAttempts = 0;
      while (!Array.isArray(characters)) {
        characters = (await storage.getItem("characters:data")) as Character[];
        loadAttempts++;

        if (loadAttempts > 100) throw new Error("Failed to load characters");
      }

      if (characters === undefined) return undefined;

      return characters.find(character => character.id === id);
    },
    async update({ where: { id = undefined, userID = undefined }, data }: { where: { id?: string, userID?: string }, data: Partial<Character> }) {
      let characters = (await storage.getItem("characters:data")) as Character[];
      let character = characters.find(character => character.id === id);
      while (!Array.isArray(characters)) {
        characters = (await storage.getItem("characters:data")) as Character[];
      }

      if (userID === undefined || userID !== character?.userID) throw new Error("Unauthorized");

      let resultBool = false;

      if (character) {
        Object.assign(character, data);

        characters.splice(characters.findIndex(character => character.id === id), 1, character);

        storage.setItem("characters:data", characters).then(() => {
          resultBool = true;
        });
      }

      return resultBool;
    },
    async delete({ where: { id = undefined, userID = undefined } }: { where: { id?: string, userID?: string } }) {
      let characters = await this.findUser({ where: { userID } });
      let index = characters.findIndex(character => character.id === id);

      if (userID === undefined || userID !== characters[index].userID) throw new Error("Unauthorized");

      characters.splice(index, 1);
      await storage.setItem("characters:data", characters);
    },
  },
  image: {
    async create({ data }: { data: { userID: string, image: string } }) {
      const [{ value: images }] = await storage.getItems(["characters:images"]);

      let image = { 
        id: genRandomID(),
        userID: data.userID,
        image: data.image
      };

      await Promise.all([
        storage.setItem("characters:images", [...(images as ProfileImage[]), image])
      ]);
      return image;
    },
    async findUser({ where: { userID = undefined } }: { where: { userID?: string }}) {
      let images = (await storage.getItem("characters:images")) as ProfileImage[];

      let loadAttempts = 0;
      while (!Array.isArray(images)) {
        images = (await storage.getItem("characters:data")) as Character[];
        loadAttempts++;

        if (loadAttempts > 100) throw new Error("Failed to load images");
      }

      if (images === undefined) return [] as Array<ProfileImage>;

      return images.filter(image => image.userID === userID);
    },
    async findUnique({ where: { id = undefined } }: { where: { id?: string } }) {
      let images = (await storage.getItem("characters:images")) as ProfileImage[];

      let loadAttempts = 0;
      while (!Array.isArray(images)) {
        images = (await storage.getItem("characters:data")) as Character[];
        loadAttempts++;

        if (loadAttempts > 100) throw new Error("Failed to load images");
      }

      if (images === undefined) return undefined;

      return images.find(image => image.id === id);
    },
    async delete({ where: { id = undefined, userID = undefined } }: { where: { id?: string, userID?: string } }) {
      let images = await this.findUser({ where: { userID } });
      let index = images.findIndex(image => image.id === id);

      if (userID === undefined || userID !== images[index].userID) throw new Error("Unauthorized");

      images.splice(index, 1);
      await storage.setItem("characters:images", images);
    }
  }
};