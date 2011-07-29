
rm -rf data
mkdir data

rm -rf ringojs
git clone git://github.com/ringo/ringojs.git

cd ringojs
ant jar
ant docs
