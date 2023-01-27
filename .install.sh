#!/bin/bash

# 아래 커맨드에서 "경로" 부분만 설치를 원하는 프로젝트의 경로를 넣어서 실행하면 됩니다
# git clone https://github.com/kstost/mygit; cd mygit; source .install.sh 경로; cd ..; rm -rf mygit;

if [ "$#" -eq 1 ]; then
	if [ -d $1 ]; then
		cp .exclude.json $1
	        cp .compare_current.sh $1
	        cp .find.sh $1
	        cp .install.sh $1
	        cp .list.sh $1
	        cp .manual.txt $1
	        cp .prepare_diff_source.py $1
	        cp .upload.sh $1
	        cp .x_check.sh $1
		echo 'install complete'
	fi
fi

