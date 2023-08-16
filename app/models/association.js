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

// Association : User <-> Event (Participation)


