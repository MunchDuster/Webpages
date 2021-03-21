let users = [];
function joinUser(socketId) {
  const user = {
    socketID: socketId,
    verse: 1,
    chapter: 1,
    book: 1,
  };
  users.push(user);
  return user;
}
function removeUser(id) {
  const getID = (users) => users.socketID === id;
  const index = users.findIndex(getID);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}
module.exports = { joinUser, removeUser };
