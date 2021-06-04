
import * as core from '@actions/core';
import * as cache from '@actions/cache';
import { exec } from '@actions/exec';

export const showStat = async () => {
	await exec(`/tmp/sccache/sccache -s`);
};

export const saveCache = async () => {
	try {
		const cacheKey    = core.getInput('cache-key');
		await cache.saveCache([`${process.env.HOME}/.cache/sccache`], cacheKey);
	} catch(err) {
		core.setFailed(err.message);
	}
};

export const run = async () => {
	try {
		await showStat();
		await saveCache();
	} catch(err) {
		core.setFailed(err.message);
	}
};

run();

