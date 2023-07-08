
import { writeFileSync } from 'fs';
const GitHub = require('github-api');
import * as core from '@actions/core';
import * as cache from '@actions/cache';
import { exec } from '@actions/exec';
import * as tc from '@actions/tool-cache';

export const getAsset = async (releaseName: string, arch: string) => {
	const gh = new GitHub({
		token: core.getInput('token'),
	});
	const repo = gh.getRepo('mozilla', 'sccache');
	const asset = await (async () => {
		if(releaseName == 'latest') {
			const release = await repo.getRelease(releaseName);
			const asset = release.data.assets.find(
				(asset: any) => new RegExp(`^sccache-v(.*?)-${arch}.tar.gz$`).test(asset.name));
			return asset;
		} else {
			const releases = await repo.listReleases();
			const release = releases.data.find((release: any) => release.tag_name == releaseName);
			const asset = release.assets.find(
				(asset: any) => new RegExp(`^sccache-${releaseName}-${arch}.tar.gz$`).test(asset.name));
			return asset;
		}
	})();
	return asset;
};

export const download = async (releaseName: string, arch: string) => {
	const asset = await getAsset(releaseName, arch);
	const token = core.getInput('token');
	const bearerToken = token ? `Bearer ${token}` : undefined;

	console.log("Downloading sccache...")
	const downloadTarget = await tc.downloadTool(asset.browser_download_url, undefined, bearerToken);

	console.log("Extracting sccache...");
	const extractTarget = await tc.extractTar(downloadTarget);

	console.log("Extracting toolchain...");
	await exec(`mv ${extractTarget}/${asset.name.replace('.tar.gz', '')} /tmp/sccache`);
	await exec(`chmod +x /tmp/sccache/sccache`);
};

export const setupRust = async () => {
	await exec(`echo "[build]\nrustc-wrapper = \\"/tmp/sccache/sccache\\"" | tee ~/.cargo/config`)
	writeFileSync(`${process.env.HOME}/.cargo/config`, `[build]\nrustc-wrapper = "/tmp/sccache/sccache"\n`);
};

export const restoreCache = async (cacheKey: string) => {
	const restoredCacheKey = await cache.restoreCache(
		[`${process.env.HOME}/.cache/sccache`], `${cacheKey}-${new Date().toISOString()}`, [`${cacheKey}-`]);
	if(restoredCacheKey) {
		core.info(`Cache restored from ${restoredCacheKey}.`);
	} else {
		core.info(`Cache not found.`);
	}
};

export const resetStat = async () => {
	await exec(`/tmp/sccache/sccache -z`);
};

export const run = async () => {
	try {
		const cacheKey    = core.getInput('cache-key');
		const releaseName = core.getInput('release-name');
		const arch        = core.getInput('arch');
		await download(releaseName, arch);
		await setupRust();
		await restoreCache(cacheKey);
		await resetStat();
	} catch(err) {
		core.setFailed(err.message);
	}
};

run();

