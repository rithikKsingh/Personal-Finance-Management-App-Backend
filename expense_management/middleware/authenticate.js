const jwt=require("jsonwebtoken");

const authenticateMiddleware=(req,res,next)=>{
    const token=req.cookies.access_token;

    if(!token){
        return res.status(401).json({message:"Authorization token not provided"})
    }

    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.user=decoded;
        next();
    }catch(error){
        console.error("Authentication error: ",error);
        return res.status(401).json({message:"Invalid or expired token"});
    }
};

module.exports=authenticateMiddleware;