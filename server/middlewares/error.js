const errorMiddleware = (err, req, res, next) => {
  
  err.statusCode = err.statusCode || 500;
  
  
  if(err.name === "CastError"){
    err.message = `Invalid Format of ${err.path}`;
    err.statusCode = 400;
  }
  
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

const TryCatch = (fn)=> async(req, res, next)=> {
  try {
   await fn(req, res, next)
  } catch (error) {
    next(error)
  }
}

export {errorMiddleware, TryCatch}