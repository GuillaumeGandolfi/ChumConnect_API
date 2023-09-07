import User from "./User.js";
import Event from "./Event.js";
import Category from "./Category.js";

// Association : User <-> User (Friend)
User.belongsToMany(User, {
    foreignKey: "user_id",
    otherKey: "friend_id",
    as: "friends",
    through: "user_has_friend"
});

// Association : User <-> User (Friend Request)
User.belongsToMany(User, {
    foreignKey: "sender_id",
    otherKey: "receiver_id",
    as: "friendRequestSent",
    through: "friend_request"
});

// Association : User <-> Event (Organizer)
User.hasMany(Event, {
    foreignKey: "organizer_id",
    as: "createdEvents"
});

Event.belongsTo(User, {
    foreignKey: "organizer_id",
    as: "organizer"
});

// Association : User <-> Event (Participant)
Event.belongsToMany(User, {
    foreignKey: "event_id",
    otherKey: "participant_id",
    as: "participants",
    through: "event_has_participant"
});

// Association : Event <-> Category
Event.belongsTo(Category, {
    foreignKey: "category_id",
    as: "category"
});

Category.hasMany(Event, {
    foreignKey: "category_id",
    as: "events"
});

// Association : User <-> Event (Invitation Sent By Organizer)
Event.belongsToMany(User, {
    foreignKey: "event_id",
    otherKey: "organizer_id",
    as: "invitationSent",
    through: "event_invitation"
});


// Association : User <-> Event (Invitation Received)
User.belongsToMany(Event, {
    foreignKey: "invited_friend_id",
    otherKey: "organizer_id",
    as: "invitationReceived",
    through: "event_invitation"
});

export default { User, Event, Category };