function pagination(pagesize, currentpage, data) {
  let value = data.slice(pagesize * (currentpage - 1), pagesize * currentpage).slice(0, pagesize);

  return {
    statusCode: 200,
    taskStatus: true,
    message: 'Success',
    pagin: {
      totalRow: data.length,
      pageSize: pagesize,
      currentPage: currentpage,
      totalPage: Math.ceil(data.length / pagesize),
    },
    data: value,
  };
}

function success() {
  return { statusCode: 200, taskStatus: true, message: 'Success' };
}

function error() {
  return { statusCode: 500, taskStatus: false, message: 'Unsuccess' };
}

function single(data) {
  return { statusCode: 200, taskStatus: true, message: 'Success', data: data[0] ? data[0] : null };
}

function multi(data) {
  return { statusCode: 200, taskStatus: true, message: 'Success', data: data };
}

module.exports = { pagination, success, error, single, multi };
