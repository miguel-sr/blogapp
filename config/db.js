if (process.env.NODE_ENV == "production") {
  module.exports = {
    mongoURI: "mongodb+srv://miguel-sr:sgQVZUnQlIIaT00G@blogapp.fja7bpy.mongodb.net/?retryWrites=true&w=majority"
  }
} else {
  module.exports = {
    mongoURI: "mongodb://127.0.0.1:27017/blogapp"
  }
}