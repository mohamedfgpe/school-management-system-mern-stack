

import jwt from 'jsonwebtoken';


export const authSoftSkillsAdmin= (req,res,next) => {
    let token = req.header("token");
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) return res.json({ message: "Token invalid", err })
        if ((decoded.role==='softSkillsAdmin' || decoded.role==='rootAdmin')&& decoded.verified===true ){
         
        req.userId = decoded.id;
        next()   
        }
        else{
            return res.json({message:'you are nut authorized'})
        }
    })

}