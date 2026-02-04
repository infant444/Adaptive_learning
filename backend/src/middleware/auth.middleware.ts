import { verify ,TokenExpiredError} from "jsonwebtoken";


export default (req: any, res: any, next: any) => {
    const token = req.headers.access_token as string;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Token missing. Please login."
        });
    }

    try {
        const decoderedUser = verify(token, process.env.JWT_USER_AUTH!);
        req.user = decoderedUser;
    } catch (error) {
         if (error instanceof TokenExpiredError) {
      return res.status(300).json({
        success: false,
        message: "Token expired"
      });
    }

    // 🔴 Invalid token
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
    }
    return next();
}