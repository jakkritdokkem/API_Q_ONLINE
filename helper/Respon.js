function pagination(pageSize, currentPage, data) {
  let value = data.slice(pageSize * (currentPage - 1), pageSize * currentPage).slice(0, pageSize);

  return {
    statusCode: 200,
    taskStatus: true,
    message: 'Success',
    pagin: {
      totalRow: data.length,
      pageSize: pageSize,
      currentPage: currentPage,
      totalPage: Math.ceil(data.length / pageSize),
    },
    data: value,
  };
}

function success() {
  return { statusCode: 200, taskStatus: true, message: 'Success' };
}

function error(statusCode = 500, message = 'Unsuccess') {
  return { statusCode: statusCode, taskStatus: false, message: message };
}

function single(data) {
  return { statusCode: 200, taskStatus: true, message: 'Success', data: data[0] ? data[0] : null };
}

function multi(data) {
  return { statusCode: 200, taskStatus: true, message: 'Success', data: data };
}

module.exports = { pagination, success, error, single, multi };
