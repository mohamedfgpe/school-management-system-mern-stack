import jwt from 'jsonwebtoken';


export const auth   = (req,res,next) => {
    let token = req.header("token");
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            console.error('Token verification error:', err);
            return res.json({ message: "Token invalid", err });
        } else if (decoded.role === 'studentFairsAdmin' || decoded.role === 'rootAdmin') {
            req.userId = decoded.id;
            next();
        } else {
            console.error('User is not authorized. Role:', decoded);
            return res.json({ message: "You are not authorized" });
        }
    });
    

}