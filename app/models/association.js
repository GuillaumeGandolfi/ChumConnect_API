import User from "./User";
import Event from "./Event";
import Category from "./Category";

// Association : User <-> User (Friend)
User.belongsToMany(User, {
    foreignKey: "user_id",
    otherKey: "friend_id",
    as: "friends",
    through: "user_has_friend"
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

export default { User, Event, Category };