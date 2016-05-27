/* global testHelpers */
import "babel-polyfill";
import chai from "chai";
import sinon from "sinon";
import pkg from "../package.json";
import "sinon-as-promised";

sinon.assert.expose( chai.assert, { prefix: "" } );

global.testHelpers = {
  assert: chai.assert,
  sinon,
  pkg
};

export default testHelpers;
