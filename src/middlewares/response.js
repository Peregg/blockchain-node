export const success = (res) => (payload) => {
  res.send({
    success: true,
    response: payload,
  });
};

export const error = (res) => (payload) => {
  res.send({
    success: false,
    response: payload,
  });
};
