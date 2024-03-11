import { createAsync, redirect, Router, type RouteDefinition, action, useAction, useSubmission } from "@solidjs/router";
import CustomTitle from "~/components/CustomTitle";
import { createProfileImage, deleteCharacter, getProfileImages, getRandomUUID, getUser, logout, updateCharacterEvents, updateCharacterTraits } from "~/lib/dashboard";

import { FaSolidUserGroup } from 'solid-icons/fa'
import { CgProfile } from 'solid-icons/cg'
import { AiFillCalculator } from 'solid-icons/ai'

import styles from "./dashboard.module.scss"
import Sidebar, { SidebarChild } from "~/components/Sidebar";
import { For, Show, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { createCharacter, getCharacters, updateCharacter } from "~/lib/dashboard";
import FloatingWindow from "~/components/FloatingWindow";
import CharacterCard from "~/components/CharacterCard";

import { Character, CharacterEvent, CharacterTrait } from "~/lib/types";
import InteractiveArray from "~/components/InteractiveArray";

// Simple notification type
type Notification = {
  message: string
  color: string
}

// Type to store the page data in localStorage in order to persist it when the user refreshes the page
// Should contain a variable per signal on this page
type PageData = {
  dashboardPage: number,
  newCharacterWindowOpen: boolean,
  isCharacterOpen: boolean,
  openCharacter: string,
  imageSelectorOpen: boolean,
  selectedImage: string,
  profileImageWindowOpen: boolean,
  addTraitWindowOpen: boolean,
  selectedTraitOpen: boolean,
  selectedTrait: string,
  addEventWindowOpen: boolean,
  selectedEventOpen: boolean,
  selectedEvent: string,
}

// Export some data loading functions to out page
export const route = {
  load: () => {
    getUser()
    getCharacters()
    getProfileImages()
  }
} satisfies RouteDefinition;

export default function Dashboard() {
  // Loading page data
  const user = createAsync(() => getUser(), { deferStream: true });
  const characters = createAsync(() => getCharacters(), { deferStream: true });
  const images = createAsync(() => getProfileImages(), { deferStream: true });

  
  // Signals for the dashboard
  let [sidebarOpen, setSidebarOpen] = createSignal(false)
  let [dashboardPage, setDashboardPage] = createSignal(-1)
  let [effectRunOnce, setEffectRunOnce] = createSignal(false)
  let [saving, setSaving] = createSignal(false)

  // Signals for the new character window
  let [newCharacterWindowOpen, setNewCharacterWindowOpen] = createSignal(false)

  // Signals for the character window
  let [isCharacterOpen, setIsCharacterOpen] = createSignal(false)
  let [openCharacter, setOpenCharacter] = createSignal<Character | null>(null)

  // Signals for the character window image selector
  let [imageSelectorOpen, setImageSelectorOpen] = createSignal(false)
  let [selectedImage, setSelectedImage] = createSignal<string>("")
  let [selectedImageDataURL, setSelectedImageDataURL] = createSignal<string>()

  // Signals for the character window profile image viewer
  let [profileImageWindowOpen, setProfileImageWindowOpen] = createSignal(false)

  // Signals for the character window traits
  let [addTraitWindowOpen, setAddTraitWindowOpen] = createSignal(false)
  let [openCharacterTraits, setOpenCharacterTraits] = createSignal<CharacterTrait[]>([])
  let [selectedTraitOpen, setSelectedTraitOpen] = createSignal(false)
  let [selectedTrait, setSelectedTrait] = createSignal<CharacterTrait | null>(null)

  // Signals for the character window events
  let [addEventWindowOpen, setAddEventWindowOpen] = createSignal(false)
  let [openCharacterEvents, setOpenCharacterEvents] = createSignal<CharacterEvent[]>([])
  let [selectedEventOpen, setSelectedEventOpen] = createSignal(false)
  let [selectedEvent, setSelectedEvent] = createSignal<CharacterEvent | null>(null)

  // Notification message
  let [notification, setNotification] = createSignal<Notification>({ message: "Welcome to the dashboard!", color: "black" })

  // Refs for the character window image section
  let chooseFileRef: any;
  let imageInputRef: any;

  // Data save guard
  let pageDataLoaded = false

  onMount(() => {
    // Load the page data from local storage
    
  })

  onCleanup(() => {
    // Save the page data to local storage
    savePageData()
  })

  createEffect(() => {
    // Sort the character events by date
    if (isCharacterOpen()) {
      setOpenCharacterEvents(openCharacterEvents().sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      }))
    }

    savePageData()

    // Will only run once after all the data for the page has been loaded
    if (user() && characters() && images() && !effectRunOnce()) {
      // Reset the notification message when the user logs in
      resetNotification()

      // Everything else here /////////////////////////////////////////////////

      // Load the page data from local storage
      loadPageData()

      /////////////////////////////////////////////////////////////////////////

      // Set that this block of code has already run once and we do not want to run it again
      setEffectRunOnce(true)
    }
  })

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function savePageData() {
    let pageData = {
      dashboardPage: dashboardPage() ?? "",
      newCharacterWindowOpen: newCharacterWindowOpen() ?? "",
      isCharacterOpen: isCharacterOpen() ?? "",
      openCharacter: openCharacter()?.id ?? "",
      imageSelectorOpen: imageSelectorOpen() ?? "",
      selectedImage: selectedImage() ?? "",
      profileImageWindowOpen: profileImageWindowOpen() ?? "",
      addTraitWindowOpen: addTraitWindowOpen() ?? "",
      selectedTraitOpen: selectedTraitOpen() ?? "",
      selectedTrait: selectedTrait()?.id ?? "",
      addEventWindowOpen: addEventWindowOpen() ?? "",
      selectedEventOpen: selectedEventOpen() ?? "",
      selectedEvent: selectedEvent()?.id ?? "",
    }

    if (typeof window !== 'undefined' && pageDataLoaded) {
      // Save the page data to local storage
      localStorage.setItem(user()?.id ?? "", JSON.stringify({dashboardPageData: pageData}))
    }
  }

  function loadPageData() {
    if (typeof window !== 'undefined') {
      // Get the page data from local storage
      let localUserData = localStorage.getItem(user()?.id ?? "")

      if (!localUserData) {
        // If the user has no local data, create a new local data object
        localStorage.setItem(user()?.id ?? "", JSON.stringify({dashboardPageData: {
          dashboardPage: 0,
          newCharacterWindowOpen: false,
          isCharacterOpen: false,
          openCharacter: "",
          imageSelectorOpen: false,
          selectedImage: "",
          selectedImageDataURL: "",
          profileImageWindowOpen: false,
          addTraitWindowOpen: false,
          selectedTraitOpen: false,
          selectedTrait: "",
          addEventWindowOpen: false,
          selectedEventOpen: false,
          selectedEvent: "",
        }}))
      }

      let localStorageData = JSON.parse(localStorage.getItem(user()?.id ?? "") ?? "{}") as {dashboardPageData: PageData}
      let localStoragePage = localStorageData.dashboardPageData

      // Set the page data from local storage
      setDashboardPage(localStoragePage.dashboardPage === -1 ? 0 : localStoragePage.dashboardPage)
      setNewCharacterWindowOpen(localStoragePage.newCharacterWindowOpen)
      setIsCharacterOpen(localStoragePage.isCharacterOpen)
      setOpenCharacter(characters()?.find(character => character.id === localStoragePage.openCharacter) ?? null)
      setImageSelectorOpen(localStoragePage.imageSelectorOpen)
      setSelectedImage(localStoragePage.selectedImage)
      setSelectedImageDataURL(getImageDataURL(openCharacter()?.image ?? ""))
      setProfileImageWindowOpen(localStoragePage.profileImageWindowOpen)
      setAddTraitWindowOpen(localStoragePage.addTraitWindowOpen)
      setOpenCharacterTraits(openCharacter()?.traits ?? [])
      setSelectedTraitOpen(localStoragePage.selectedTraitOpen)
      setSelectedTrait(openCharacterTraits()?.find(trait => trait.id === localStoragePage.selectedTrait) ?? null)
      setAddEventWindowOpen(localStoragePage.addEventWindowOpen)
      setOpenCharacterEvents(openCharacter()?.events ?? [])
      setSelectedEventOpen(localStoragePage.selectedEventOpen)
      setSelectedEvent(openCharacterEvents()?.find(event => event.id === localStoragePage.selectedEvent) ?? null)

      pageDataLoaded = true
    }
  }

  function onCharacterOpen(character: Character) {
    // Set the open character
    setOpenCharacter(character)

    // Set the selected character data that we need to work with
    setSelectedImageDataURL(images()?.find(image => image.id === character.image)?.image)
    setOpenCharacterTraits(openCharacter()?.traits ?? [])
    setOpenCharacterEvents(openCharacter()?.events ?? [])

    // Open the character window
    setIsCharacterOpen(true)
  }

  function onCharacterClose() {
    // Clear all open character data
    setOpenCharacter(null)
    setOpenCharacterTraits([])
    setOpenCharacterEvents([])

    // Clear any refs used in the character window
    if (imageInputRef) {
      imageInputRef.value = ""
    }

    if (chooseFileRef) {
      chooseFileRef.value = ""
    }

    // Close any windows above the character window
    setProfileImageWindowOpen(false)
    setAddTraitWindowOpen(false)
    setAddEventWindowOpen(false)

    // Clear the selected image/trait/event
    setSelectedImage("")
    setSelectedTrait(null)
    setSelectedEvent(null)
    
    // Close the character window
    setIsCharacterOpen(false)
  }

  // Returns the index of the open character in the characters array (NOT THE ID OF THE CHARACTER)
  function getOpenCharacterIndex() { return characters()?.findIndex((character) => character.id === openCharacter()?.id) }

  function getNextCharacter() {
    // Get a copy of the list of characters
    let definedCharacters = characters() ?? []

    // Get the index of the open character
    let index = getOpenCharacterIndex() ?? 0

    // If the open character is the last character in the list, return the first character
    // Otherwise, return the next character in the list
    if (index === definedCharacters.length - 1)
      return definedCharacters[0]
    else
      return definedCharacters[index + 1]
  }

  function getPreviousCharacter() {
    // Get a copy of the list of characters
    let definedCharacters = characters() ?? []

    // Get the index of the open character
    let index = getOpenCharacterIndex() ?? 0

    // If the open character is the first character in the list, return the last character
    // Otherwise, return the previous character in the list
    if (index === 0)
      return definedCharacters[definedCharacters.length - 1]
    else
      return definedCharacters[index - 1]
  }

  const deleteCharacterAction = useAction(deleteCharacter)
  function removeCharacter(id: string) {
    // Remove the character from the database
    deleteCharacterAction(id)

    // Close the character window
    onCharacterClose()
  }

  const uploadImage = useAction(createProfileImage)
  function onImageSelectorOpen() {
    // Clear the selected image
    setSelectedImage("")

    // Open the image selector window
    setImageSelectorOpen(true)
  }

  async function onFileSelectorChange(el: any) {
    if (el.target && el.target.files && el.target.files.length > 0) {
      // Get the file and convert it to base64
      let file = await el.target.files[0].arrayBuffer()
      let base64 = btoa(new Uint8Array(file).reduce((data, byte) => data + String.fromCharCode(byte), ''))

      // Upload the image to the database in base64 format
      uploadImage(`data:image/png;base64,${base64}`)
    }
  }

  function onImageSelectorClose() {
    // Clear the selected image
    setSelectedImage("")

    // Close the image selector window
    setImageSelectorOpen(false)
  }

  function onImageSelect() {
    // Set the character's invisible image input field to the selected image
    // We need to do this because we have to have a physical input field to submit the form
    imageInputRef.value = selectedImage()

    if (isCharacterOpen()) {
      if (imageInputRef) {
        // We double set it after checking that everything is good
        imageInputRef.value = imageInputRef.value ?? selectedImage()

        // We grab the actual image data from the database and set it to the character's image
        let selectedImageData = images()?.find(image => image.id === imageInputRef.value)
        if (selectedImageData)
          setSelectedImageDataURL(selectedImageData.image)
      }
    }

    // Clear the selected image
    setSelectedImage("")

    // Close the image selector window
    setImageSelectorOpen(false)
  }

  function getImageDataURL(id: string): string {
    // Get the image data from the database and return the image
    let imageData = images()?.find(image => image.id === id)

    // If the image data exists, return the image data
    if (imageData)
      return imageData.image
    else
      return ""
  }

  const updateCharacterTraitsAction = useAction(updateCharacterTraits)
  const addNewTraitAction = action(async (formData: FormData) => {
    // Get the trait name and value from the form data
    const traitName = String(formData.get("traitName"));
    const traitValue = Number(formData.get("traitValue"));

    const traitID = generateUUID()

    // Add the new trait to the open character's traits
    setOpenCharacterTraits([...openCharacterTraits(), {id: traitID, name: traitName, value: traitValue}])
  })

  function removeTrait(trait: CharacterTrait) {
    // Remove the trait from the open character's traits
    setOpenCharacterTraits(openCharacterTraits().filter(t => t !== trait))
  }

  function onTraitDoubleClick(trait: CharacterTrait) {
    // Open the current trait in a window
    setSelectedTrait(trait)
    setSelectedTraitOpen(true)
  }

  function closeSelectedTraitWindow() {
    // Clear the selected trait
    setSelectedTrait(null)

    // Close the selected trait window
    setSelectedTraitOpen(false)
  }

  const updateSingleTrait = action(async (formData: FormData) => {
    // Get the trait name and value from the form data
    const name = String(formData.get("traitName"));
    const value = Number(formData.get("traitValue"));

    // Update the selected trait's name and value
    setSelectedTrait({id: selectedTrait()?.id, name: name, value: value} as CharacterTrait)
    
    // Update the open character's traits
    openCharacterTraits().splice(openCharacterTraits().findIndex(trait => trait.id === selectedTrait()?.id), 1, {id: selectedTrait()?.id, name: name, value: value} as CharacterTrait)
    setOpenCharacterTraits([...openCharacterTraits()])
  })

  const updateCharacterEventsAction = useAction(updateCharacterEvents)
  const addNewEventAction = action(async (formData: FormData) => {
    // Get the event name, date, description, and location from the form data
    const eventName = String(formData.get("eventName"));
    const eventDate = String(formData.get("eventDate"));
    const eventDescription = String(formData.get("eventDescription"));
    const eventLocation = String(formData.get("eventLocation"));

    const eventID = generateUUID()

    // Add the new event to the open character's events
    setOpenCharacterEvents([...openCharacterEvents(), {
      id: eventID,
      name: eventName,
      date: eventDate, 
      description: eventDescription,
      location: eventLocation,
    }])
  })

  function removeEvent(event: CharacterEvent) {
    // Remove the event from the open character's events
    setOpenCharacterEvents(openCharacterEvents().filter(e => e !== event))
  }

  function onEventDoubleClick(event: CharacterEvent) {
    // Open the current event in a window
    setSelectedEvent(event)
    setSelectedEventOpen(true)
  }

  function closeSelectedEventWindow() {
    // Clear the selected event
    setSelectedEvent(null)

    // Close the selected event window
    setSelectedEventOpen(false)
  }

  const updateSingleEvent = action(async (formData: FormData) => {
    // Get the event name, date, description, and location from the form data
    const name = String(formData.get("eventName"));
    const date = String(formData.get("eventDate"));
    const description = String(formData.get("eventDescription"));
    const location = String(formData.get("eventLocation"));

    // Update the selected event's name, date, description, and location
    setSelectedEvent({id: selectedEvent()?.id, name: name, date: date, description: description, location: location} as CharacterEvent)
    
    // Update the open character's events
    openCharacterEvents().splice(openCharacterEvents().findIndex(event => event.id === selectedEvent()?.id), 1, {id: selectedEvent()?.id, name: name, date: date, description: description, location: location} as CharacterEvent)
    setOpenCharacterEvents([...openCharacterEvents()])
  })

  function resetNotification() {
    setNotification({
      message: `Welcome back, ${user()?.username}!`.toUpperCase(),
      color: "limegreen",
    })
  }

  function notify(notification: Notification) {
    setNotification({
      message: notification.message.toUpperCase(),
      color: notification.color,
    })

    setTimeout(() => resetNotification(), 1000 * 15)
  }

  // Return the dashboard html as JSX
  return (
    <>
      <CustomTitle>Dashboard</CustomTitle>
      <main>
        <div class={styles.dashboard}>
          <Sidebar onOpen={() => setSidebarOpen(true)} onClose={() => setSidebarOpen(false)}>
            <SidebarChild label="Characters" open={sidebarOpen()} onClick={() => setDashboardPage(0)}>
              <FaSolidUserGroup />
            </SidebarChild>
            <SidebarChild label="Calculator" open={sidebarOpen()} onClick={() => setDashboardPage(2)}>
              <AiFillCalculator />
            </SidebarChild>
            <SidebarChild label="User" open={sidebarOpen()} onClick={() => setDashboardPage(1)}>
              <CgProfile />
            </SidebarChild>
          </Sidebar>
          <div class={styles.dashboardView}>
            <Show when={dashboardPage() === -1}>
              <div class={styles.loadingScreen}>
                <h1>Loading...</h1>
              </div>
            </Show>
            <Show when={dashboardPage() === 0}>
              <div class={styles.title}>
                <h1>Characters</h1>
                <p class={styles.notification} style={{ "color": notification().color }}><em>{notification().message}</em></p>
              </div>
              {/* CHARACTERS */}
              <div class={styles.characterSection}>
                <For each={characters() ?? []}>
                  {character => (
                    <CharacterCard character={character} getCharImage={getImageDataURL} onOpen={onCharacterOpen}/>
                  )}
                </For>
                <CharacterCard isAdd={true} newChar={() => setNewCharacterWindowOpen(true)} />
                <Show when={newCharacterWindowOpen()}>
                  <FloatingWindow title="New Character" onClose={() => setNewCharacterWindowOpen(false)} width={400} height={300}>
                    <form action={createCharacter} method="post" onSubmit={() => setNewCharacterWindowOpen(false)}>
                      <input type="text" name="firstName" placeholder="First Name" />
                      <input type="text" name="middleName" placeholder="Middle Name" />
                      <input type="text" name="lastName" placeholder="Last Name" />
                      <button type="submit">Create</button>
                      <button type="button" onClick={() => setNewCharacterWindowOpen(false)}>Cancel</button>
                    </form>
                  </FloatingWindow>
                </Show>
                <Show when={isCharacterOpen()}>
                  <FloatingWindow title="Character" onClose={onCharacterClose} width={800} height={650}>
                    <form class={styles.characterForm} action={updateCharacter} method="post" ref={formRef => {
                      if (formRef) {
                        formRef.addEventListener("submit", (e) => {
                          setSaving(true)

                          setTimeout(() => updateCharacterTraitsAction(openCharacter()?.id ?? "", openCharacterTraits()).then(() => {
                            updateCharacterEventsAction(openCharacter()?.id ?? "", openCharacterEvents()).then(() => {
                              notify({
                                message: `Character [${openCharacter()?.firstName}] [${openCharacter()?.lastName}] saved!`,
                                color: "skyblue",
                              })
                              setTimeout(() => {
                                onCharacterClose()
                                setSaving(false)
                              }, 1);
                            })
                          }), 20)
                        })
                      }
                    }}>
                      <input name="cid" type="text" style={{ "display": "none" }} value={openCharacter()?.id} />
                      <div class={styles.characterWindow}>
                        <div>
                          <fieldset style={{ 
                            "border-right": "none", 
                            "border-top-right-radius": "0px", 
                            "border-bottom-right-radius": "0px",
                          }}>
                            <legend>Character</legend>
                            <div>
                              <legend>First Name:</legend>
                              <input name="firstName" type="text" value={openCharacter()?.firstName} />
                            </div>
                            <div>
                              <legend>Middle Name:</legend>
                              <input name="middleName" type="text" value={openCharacter()?.middleName} />
                            </div>
                            <div>
                              <legend>Last Name:</legend>
                              <input name="lastName" type="text" value={openCharacter()?.lastName} />
                            </div>
                            <div>
                              <legend>Species:</legend>
                              <input name="species" type="text" value={openCharacter()?.species} />
                            </div>
                            <div>
                              <legend>Birthdate:</legend>
                              <input name="birthdate" type="date" value={openCharacter()?.birthdate} />
                            </div>
                            <div>
                              <legend>Age:</legend>
                              <input name="age" type="number" value={openCharacter()?.age} />
                            </div>
                            <div>
                              <legend>Birthplace:</legend>
                              <input name="birthplace" type="text" value={openCharacter()?.birthplace} />
                            </div>
                            <div class={styles.textareaDiv}>
                              <legend>Backstory:</legend>
                              <textarea name="backstory" value={openCharacter()?.backstory} />
                            </div>
                          </fieldset>
                        </div>
                        <div>
                          <fieldset style={{ 
                            "border-right": "none", 
                            "border-left": "none",
                            "border-radius": "0px",
                          }}>
                            <legend>Traits</legend>
                            <div class={styles.characterImageSection}>
                              <img class={styles.characterImage} src={selectedImageDataURL()} width={200} height={500} alt="Character profile" />
                              <div>
                                <input name="image" type="text" value={openCharacter()?.image} style={{ "display": "none" }} ref={imageInputRef} />
                                <input type="file" accept="image/*" style={{ "display": "none" }} ref={chooseFileRef} onChange={onFileSelectorChange}/>
                                <div class={styles.imageSectionBar} style={{ "margin": "auto" }}>
                                  <button type="button" onClick={() => chooseFileRef.click()}>Upload</button>
                                  <button type="button" onClick={() => setProfileImageWindowOpen(true)}>View</button>
                                  <button type="button" onClick={onImageSelectorOpen}>Select</button>
                                </div>
                              </div>
                            </div>
                            <InteractiveArray 
                              array={openCharacterTraits()} 
                              title="Traits" 
                              onAdd={() => setAddTraitWindowOpen(true)} 
                              onRemove={removeTrait}
                              itemBodyFunction={ (trait: CharacterTrait) => <p>{trait.value}%</p> }
                              onDoubleClick={onTraitDoubleClick}
                            />
                          </fieldset>
                        </div>
                        <div>
                          <fieldset style={{ 
                            "border-left": "none", 
                            "border-top-left-radius": "0px", 
                            "border-bottom-left-radius": "0px" 
                          }}>
                            <legend>Events</legend>
                            <div class={styles.aiTools}>
                              <div class={styles.aiHeader}>
                                <p>AI Tools</p>
                              </div>
                              <div>
                                <button type="button">First</button>
                                <button type="button">Middle</button>
                                <button type="button">Last</button>
                                <button type="button">Age</button>
                                <button type="button">Birth</button>
                                <button type="button">Species</button>
                                <button type="button">Place</button>
                                <button type="button">Story</button>
                              </div>
                            </div>
                            <InteractiveArray 
                              array={openCharacterEvents()} 
                              title="Events" 
                              onAdd={() => setAddEventWindowOpen(true)} 
                              onRemove={removeEvent}
                              itemBodyFunction={ (event: CharacterEvent) => <p>{event.date}</p> }
                              onDoubleClick={onEventDoubleClick}
                              style="margin-left: 16px;"
                            />
                          </fieldset>
                        </div>
                      </div>
                      <div class={styles.actionBar}>
                        <button type="submit">Save</button>
                        <button type="button" onClick={onCharacterClose}>Close</button>
                        <button type="button" onClick={() => removeCharacter(openCharacter()?.id ?? "")}>Delete</button>
                        <button type="button" onClick={() => onCharacterOpen(getPreviousCharacter())}>Previous</button>
                        <button type="button" onClick={() => onCharacterOpen(getNextCharacter())}>Next</button>
                      </div>
                    </form>
                    <Show when={saving()}>
                      <div class={styles.savingScreen}>
                        <h1>Saving...</h1>
                      </div>
                    </Show>
                  </FloatingWindow>
                </Show>
                <Show when={imageSelectorOpen()}>
                  <FloatingWindow title="Select Image" onClose={onImageSelectorClose} width={400} height={500}>
                    <div class={styles.imageSelectorGrid}>
                      <For each={images() ?? []}>
                        {image => (
                          <img 
                            src={image.image} 
                            width={100} 
                            height={100} 
                            alt="Profile Image" 
                            onClick={() => setSelectedImage(image.id)}
                            style={{ 
                              "border": selectedImage() === image.id ? "4px solid #2196f3" : "4px solid #f5f5f5", 
                              "margin-left": "4px" 
                            }}
                          />
                        )}
                      </For>
                    </div>
                    <div class={styles.actionBar2}>
                      <button onClick={onImageSelect}>Select</button>
                      <button onClick={onImageSelectorClose}>Cancel</button>
                    </div>
                  </FloatingWindow>
                </Show>
                <Show when={profileImageWindowOpen()}>
                  <FloatingWindow title="Profile Image" onClose={() => setProfileImageWindowOpen(false)} width={600} height={500}>
                    <img src={selectedImageDataURL()} alt="Profile Image" style={{ "width": "600px", "height": "420px" }}/>
                    <div class={styles.actionBar2}>
                      <button onClick={() => setProfileImageWindowOpen(false)} style={{ "width": "100%" }}>Close</button>
                    </div>
                  </FloatingWindow>
                </Show>
                <Show when={addTraitWindowOpen()}>
                  <FloatingWindow title="Add Trait" onClose={() => setAddTraitWindowOpen(false)} width={400} height={200}>
                    <form action={addNewTraitAction} method="post" ref={formRef => {
                      if (formRef) {
                        formRef.addEventListener("submit", (e) => {
                          setTimeout(() => setAddTraitWindowOpen(false), 10)
                        })
                      }
                    }}>
                      <input type="text" name="traitName" placeholder="Trait Name" />
                      <input type="number" name="traitValue" placeholder="Trait Weight Percent" />
                      <div class={styles.actionBar2}>
                        <button type="submit">Add</button>
                        <button type="button" onClick={() => setAddTraitWindowOpen(false)}>Cancel</button>
                      </div>
                    </form>
                  </FloatingWindow>
                </Show>
                <Show when={addEventWindowOpen()}>
                  <FloatingWindow title="Add Event" onClose={() => setAddEventWindowOpen(false)} width={400} height={400}>
                    <form action={addNewEventAction} method="post" ref={formRef => {
                      if (formRef) {
                        formRef.addEventListener("submit", (e) => {
                          setAddEventWindowOpen(false)
                        })
                      }
                    }}>
                      <input type="text" name="eventName" placeholder="Event Name" />
                      <input type="date" name="eventDate" />
                      <input type="text" name="eventLocation" placeholder="Event Location" />
                      <textarea name="eventDescription" placeholder="Event Description" style={{ "height": "180px", "resize": "none" }}/>
                      <div class={styles.actionBar2}>
                        <button type="submit">Add</button>
                        <button type="button" onClick={() => setAddEventWindowOpen(false)}>Cancel</button>
                      </div>
                    </form>
                  </FloatingWindow>
                </Show>
                <Show when={selectedTraitOpen()}>
                  <FloatingWindow title="Trait" onClose={() => setSelectedTraitOpen(false)} width={400} height={200}>
                    <form action={updateSingleTrait} method="post" ref={formRef => {
                      if (formRef) {
                        formRef.addEventListener("submit", (e) => {
                          setTimeout(() => closeSelectedTraitWindow(), 10)
                        })
                      }
                    }}>
                      <div class={styles.arrayWindow}>
                        <div>
                          <legend>Name:</legend>
                          <input type="text" name="traitName" value={selectedTrait()?.name} />
                        </div>
                        <div>
                          <legend>Trait Weight Percent:</legend>
                          <input type="number" name="traitValue" value={selectedTrait()?.value} />
                        </div>
                      </div>
                      <div class={styles.actionBar2}>
                        <button type="submit">Save</button>
                        <button type="button" onClick={closeSelectedTraitWindow}>Close</button>
                      </div>
                    </form>
                  </FloatingWindow>
                </Show>
                <Show when={selectedEventOpen()}>
                  <FloatingWindow title="Event" onClose={() => setSelectedEventOpen(false)} width={400} height={400}>
                    <form action={updateSingleEvent} method="post" ref={formRef => {
                      if (formRef) {
                        formRef.addEventListener("submit", (e) => {
                          setTimeout(() => closeSelectedEventWindow(), 10)
                        })
                      }
                    }}>
                      <div class={styles.arrayWindow}>
                        <div>
                          <legend>Name:</legend>
                          <input type="text" name="eventName" value={selectedEvent()?.name} />
                        </div>
                        <div>
                          <legend>Date:</legend>
                          <input type="date" name="eventDate" value={selectedEvent()?.date} />
                        </div>
                        <div>
                          <legend>Location:</legend>
                          <input type="text" name="eventLocation" value={selectedEvent()?.location} />
                        </div>
                        <div class={styles.textareaDiv}>
                          <legend>Description:</legend>
                          <textarea name="eventDescription" value={selectedEvent()?.description} style={{ "height": "180px", "resize": "none" }}/>
                        </div>
                      </div>
                      <div class={styles.actionBar2}>
                        <button type="submit">Save</button>
                        <button type="button" onClick={closeSelectedEventWindow}>Close</button>
                      </div>
                    </form>
                  </FloatingWindow>
                </Show>
              </div>
            </Show>
            <Show when={dashboardPage() === 1}>
              <h1>User</h1>
              {/* USER DASHBOARD / ACCOUNT PROFILE */}
              <h2>{user()?.username}</h2>
              <form action={logout} method="post">
                <button name="logout" type="submit">Logout</button>
              </form>
            </Show>
            <Show when={dashboardPage() === 2}>
              <div class={styles.title}>
                <h1>Calculator</h1>
              </div>
            </Show>
          </div>
        </div>
      </main>
    </>
  )
}