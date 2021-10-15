export default function hasProps(props) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    try {
      props.forEach((prop) => {
        if (!data[prop]) {
          const error = new Error(`A ${prop} is required.`);
          error.status = 400;
          throw error;
        }
      })
      next();
    } catch (error) {
      next(error);
    }
  };
}