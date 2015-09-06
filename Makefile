GIT_USER := eeqj
GIT_REMOTE_REPO := na
CURRENTBRANCH := $(shell git rev-parse --abbrev-ref HEAD)
YYYYMMDD := $(shell date -u +%Y%m%d)
WORKBRANCH := $(YYYYMMDD)-$(USER)


default: begin

.PHONY: inside up build clean default test test_master deploy distclean

up:
	vagrant up

build: up
	vagrant ssh -c 'cd /vagrant && make inside'

begin:
	git fetch origin
	git checkout master
	git pull origin master
	-git branch $(WORKBRANCH)
	git checkout $(WORKBRANCH)
	git merge --no-ff master -m "automerge"

end: test
	git commit -a
	make push

push: 
	-git remote add origin git@github.com:$(GIT_USER)/$(GIT_REMOTE_REPO).git
	git push origin $(WORKBRANCH)


inside: up
	echo 'hi'

local_serve: up
	vagrant ssh -c 'cd /vagrant && envdir ./env nodejs bin/server.js'

test_master:
	git checkout master
	make test

deploy: test_master
	git checkout master

clean:
	-rm -rf node_modules
	-rm npm-debug.log
	-rm coverage
	
distclean: clean
	vagrant destroy -f
