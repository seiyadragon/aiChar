export type User = {
  id: string;
  username: string;
  password: string;
};

export type CharacterTrait = {
  id: string,
  name: string,
  value: number,
}

export type CharacterEvent = {
  id: string,
  name: string,
  date: string,
  description: string,
  location: string,
}

export type Character = {
  userID: string,
  id: string,
  firstName: string,
  middleName: string,
  lastName: string,
  age: number,
  species: string,
  birthdate: string,
  birthplace: string,
  backstory: string,
  traits: CharacterTrait[],
  events: CharacterEvent[],
  image: string,
};

export type ProfileImage = {
  id: string,
  userID: string,
  image: string,
};