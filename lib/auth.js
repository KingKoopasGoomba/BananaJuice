module.exports = {
    ensureAuthenticated: function(req, res, next) {
        //if (req.isAuthenticated) {  //shits cooked doesnt work
        if (req.user != null) {
            return next();
        }
        //req.flash('error_msg', 'Please log in to view that resource');
        res.redirect('/users/login');
    }
};