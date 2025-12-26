
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require ('../models/User'); //me traigo los datos de la DB


passport.use(new LocalStrategy({
    usernameField: 'email'
}, async (email, password, done) => {
    const user = await User.findOne({email: email});
    if (!user){
        return done(null, false, {message: 'Usuario No existente!'});
    } else {
        //console.log('password', password)
        const match = await user.matchPassword(password); // user es de la instanscia d la clase const user linea 9
        console.log('match', match)
        if (match){
            return done(null, user);            
        } else {
            return done(null, false, {message: 'Contraseña Incorrecta!'})
        }
    }
}));

//aca dejamos iniciada la sesion

passport.serializeUser((user, done) =>{
    done(null, user.id);
});

//proceso de usuario iniciado en sesion
passport.deserializeUser((id, done) =>{
    User.findById(id, (err, user) => {
        done(err, user);
    })
})
