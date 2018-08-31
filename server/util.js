


module.exports = {
     hasRole : function hasRole(user) {
        if (user && user.roles) {
            function hasRole(e, i, arr) {
                return user.roles.includes(e);
            }
            return Array.from(arguments).some(hasRole);
        }
        return false;
    }
};