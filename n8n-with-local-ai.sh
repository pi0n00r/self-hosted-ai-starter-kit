#!/bin/sh
set -eu

package_name=n8n-nodes-local-ai
package_version=0.1.1
package_tarball=/opt/n8n-custom-packages/n8n-nodes-local-ai.tgz
install_root=/home/node/.n8n/nodes
installed_package="$install_root/node_modules/$package_name/package.json"

installed_version=
if [ -f "$installed_package" ]; then
	installed_version=$(
		node -e 'process.stdout.write(require(process.argv[1]).version)' \
			"$installed_package"
	)
fi

if [ "$installed_version" != "$package_version" ]; then
	mkdir -p "$install_root"
	npm install \
		--prefix "$install_root" \
		--no-save \
		--omit=dev \
		--legacy-peer-deps \
		--ignore-scripts \
		--no-audit \
		--no-fund \
		"$package_tarball"
fi

exec /docker-entrypoint.sh "$@"
