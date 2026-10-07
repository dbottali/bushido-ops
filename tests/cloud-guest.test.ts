import test from "node:test";
import assert from "node:assert/strict";
import {decodeGuest,emptyGuest,previewScore} from "../lib/guest-preview";
import {resolveCloudRoute} from "../lib/cloud-navigation";
test("guest preview safely survives reload without trusting completion or local XP",()=>{
  const guest=decodeGuest(JSON.stringify({version:1,answers:{logos:"1","official-channel":"2","private-code":"0"},submitted:true,xp:9999,completed:true}));
  assert.equal(previewScore(guest),3);assert(guest.submitted);assert(!("xp" in guest));
  assert.deepEqual(decodeGuest("bad"),emptyGuest());
  assert.equal(decodeGuest(JSON.stringify({version:1,answers:{logos:"99"},submitted:true})).submitted,false);
});
test("cloud routes allow published course IDs but reject malformed or overlong paths",()=>{
  assert.deepEqual(resolveCloudRoute("#dojo/white-basics/final-exam"),{courseId:"white-basics",moduleId:"final-exam"});
  assert.deepEqual(resolveCloudRoute("#dojo/lesson"),{courseId:"white-phishing-pilot",moduleId:"lesson"});
  assert(resolveCloudRoute("#dojo/../../owner").error);assert(resolveCloudRoute("#dojo/%2Fbad").error);
});
