const POSSIBLE_ID_CHARS = '0123456789';
const EVENT_ID_LEN = 4;

function getRandomEventId() {
  let text = '';

  for (let i = 0; i < EVENT_ID_LEN; i++) {
    text += POSSIBLE_ID_CHARS.charAt(
        Math.floor(Math.random() * POSSIBLE_ID_CHARS.length));
  }

  return text;
}

function getUniqueRandomEventId(database) {
  const eventId = getRandomEventId();

  return database.ref('events/' + eventId).once('value').then(data => {
    if (data.exists()) {
      return getUniqueRandomEventId(database);
    }
    return eventId;
  });
}

export {getUniqueRandomEventId};
