/* eslint-env mocha */
/* global testHelpers */
import nock from "nock";
import ApiChecker from "./index";

var { assert } = testHelpers;

describe( "au-pair-api checker", () => {
  let checker, result;

  describe( "validation", () => {
    it( "should require `name`", () => {
      assert.throws( () => new ApiChecker( { uri: "http://localhost" } ) );
    } );
    it( "should require `uri`", () => {
      assert.throws( () => new ApiChecker( { name: "name" } ) );
    } );
    it( "should throw when `uri` is not a valid uri", () => {
      assert.throws( () => new ApiChecker( { name: "test", uri: "invalid" } ) );
    } );
    it( "should throw when `uri` is a relative uri", () => {
      assert.throws( () => new ApiChecker( { name: "test", uri: "/relative/path" } ) );
    } );
    it( "should not throw when `uri` is a valid qualified uri", () => {
      assert.doesNotThrow( () => new ApiChecker( { name: "test", uri: "http://localhost" } ) );
    } );
  } );

  describe( "with the default transforms", () => {
    beforeEach( () => {
      checker = new ApiChecker( { name: "something", uri: "http://localhost/status" } );
    } );

    describe( "with a healthy endpoint", () => {
      beforeEach( async () => {
        nock( "http://localhost" )
          .get( "/status" )
          .reply( 200, { status: "OK" } ); // eslint-disable-line no-magic-numbers

        result = await checker.check();
      } );

      it( "should return a healthy status", () => {
        assert.isTrue( result.healthy );
      } );

      it( "should return an undefined error message", () => {
        assert.isUndefined( result.error );
      } );
    } );

    describe( "with an endpoint that responds with an error message", () => {
      beforeEach( async () => {
        nock( "http://localhost" )
          .get( "/status" )
          .reply( 422, { error: "Not OK, man" } ); // eslint-disable-line no-magic-numbers

        result = await checker.check();
      } );

      it( "should return an unhealthy status", () => {
        assert.isFalse( result.healthy );
      } );

      it( "should return an undefined error message", () => {
        assert.deepEqual( result.error, new Error( "Not OK, man" ) );
      } );
    } );
  } );

  describe( "with custom transforms", () => {
    beforeEach( () => {
      checker = new ApiChecker( {
        name: "test",
        uri: "http://localhost/status",
        transforms: {
          response( response ) {
            let healthy = response.body.status === "good" || response.body.status === "minor";
            return {
              healthy,
              error: healthy ? undefined : response.body.body,
              timestamp: response.created_on
            };
          }
        }
      } );
    } );

    describe( "with a healthy endpoint", () => {
      beforeEach( async () => {
        nock( "http://localhost" )
          .get( "/status" )
          .reply( 200, { status: "good" } ); // eslint-disable-line no-magic-numbers

        result = await checker.check();
      } );

      it( "should return a healthy status", () => {
        assert.isTrue( result.healthy );
      } );

      it( "should return an undefined error message", () => {
        assert.isUndefined( result.error );
      } );
    } );

    describe( "with an endpoint that responds with an error message", () => {
      beforeEach( async () => {
        nock( "http://localhost" )
          .get( "/status" )
          .reply( 200, { body: "Not OK, man" } ); // eslint-disable-line no-magic-numbers

        result = await checker.check();
      } );

      it( "should return an unhealthy status", () => {
        assert.isFalse( result.healthy );
      } );

      it( "should return an undefined error message", () => {
        assert.deepEqual( result.error, "Not OK, man" );
      } );
    } );
  } );

  afterEach( () => {
    nock.cleanAll();
  } );
} );
