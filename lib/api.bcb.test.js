const api = require('./api.bcb');
const axios = require('axios');

jest.mock('axios');

test('getCotacaoApi', () => {
  const res = {
    data: {
      value: [{ cotacaoVenda: 3.92 }],
    },
  };

  axios.get.mockResolvedValue(res);
  api.getCotacaoApi('url').then((resp) => {
    expect(resp).toEqual(res);
    expect(axios.get.mock.calls[0][0]).toBe('url');
  });
});

test('extractCotacao', () => {
  const cotacao = api.extractCotacao({
    data: {
      value: [{ cotacaoVenda: 3.92 }],
    },
  });
  expect(cotacao).toBe(3.92);
});

describe('getToday', () => {
  const RealDate = Date;

  function mockDate(date) {
    global.Date = class extends RealDate {
      constructor() {
        return new RealDate(date);
      }
    };
  }
  afterEach(() => {
    global.Date = RealDate;
  });

  test('getToday', () => {
    mockDate('2019-01-01T12:00:00z');
    const today = api.getToday();
    expect(today).toBe('1-1-2019');
  });
});

test('getUrl', () => {
  const url = api.getUrl('MINHADATA');
  console.log(url);
  expect(url).toBe(
    "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao='MINHADATA'&$top=100&$format=json&$select=cotacaoCompra,cotacaoVenda,dataHoraCotacao "
  );
});

test('getCotacao', () => {
  const res = {
    data: {
      value: [{ cotacaoVenda: 3.92 }],
    },
  };
  const getToday = jest.fn();
  getToday.mockReturnValue('01-01-2019');

  const getUrl = jest.fn();
  getUrl.mockReturnValue('url');

  const getCotacaoApi = jest.fn();
  getCotacaoApi.mockReturnValue(res);

  const extractCotacao = jest.fn();
  extractCotacao.mockReturnValue(3.92);

  api.pure
    .getCotacao({ getToday, getUrl, getCotacaoApi, extractCotacao })()
    .then((res) => expect(res).toBe(3.92));
});

test('getCotacao', () => {
  const res = {};
  const getToday = jest.fn();
  getToday.mockReturnValue('01-01-2019');

  const getUrl = jest.fn();
  getUrl.mockReturnValue('url');

  const getCotacaoApi = jest.fn();
  getCotacaoApi.mockReturnValue(Promise.reject('err'));

  const extractCotacao = jest.fn();
  extractCotacao.mockReturnValue(3.92);

  api.pure
    .getCotacao({ getToday, getUrl, getCotacaoApi, extractCotacao })()
    .then((res) => expect(res).toBe(''));
});
