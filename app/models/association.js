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

// Association : User <-> User (Friend Request Sent)
User.belongsToMany(User, {
    foreignKey: "sender_id",
    otherKey: "receiver_id",
    as: "friendRequestSent",
    through: "user_friend_request_sent"
});

// Association : User <-> User (Friend Request Received)
User.belongsToMany(User, {
    foreignKey: "receiver_id",
    otherKey: "sender_id",
    as: "friendRequestReceived",
    through: "user_friend_request_received"
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
User.belongsToMany(Event, {
    foreignKey: "user_id",
    otherKey: "event_id",
    as: "participatedEvents",
    through: "user_has_event"
});

Event.belongsToMany(User, {
    foreignKey: "event_id",
    otherKey: "participant_id",
    as: "participants",
    through: "uevent_has_participant"
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
User.belongsToMany(Event, {
    foreignKey: "organizer_id",
    otherKey: "invited_user_id",
    as: "invitationSent",
    through: "event_invitation_sent"
});

// Association : User <-> Event (Invitation Received)
User.belongsToMany(Event, {
    foreignKey: "invited_user_id",
    otherKey: "organizer_id",
    as: "invitationReceived",
    through: "event_invitation_received"
});

export default { User, Event, Category };