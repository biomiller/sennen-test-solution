import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../src/main';
chai.use(chaiHttp);
chai.should();

describe("GET /getEarliestSunrise", () => {
    it("get earliest sunrise from 100 random lat & longs", function (done) {
        this.timeout(50000);
        chai.request(app)
            .get('/getEarliestSunrise')
            .end((error, response) => {
                response.should.have.status(200);
                response.body.should.be.a('object');
                response.body["earliestSunrise"].should.be.a('string');
                response.body["dayLength"].should.be.a('string');
                response.body["dayLength"].should.not.equal('00h:00min:00sec');
                done();
            });
    });
})