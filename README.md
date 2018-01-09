[![Build Status](https://travis-ci.org/opspec-pkgs/azure.apimanagement.products.set.svg?branch=master)](https://travis-ci.org/opspec-pkgs/azure.apimanagement.products.set)

# Problem statement

create/update azure api management products.

products are provided in the form of the following conventional dir structure:
```text
  |--
    |-- products
      |-- {product-name} # repeat as needed
        |-- configuration.json
```
see [example](example)

# Format

this version of the pkg is in
[![opspec 0.1.5](https://img.shields.io/badge/opspec-0.1.5-brightgreen.svg?colorA=6b6b6b&colorB=fc16be)](https://opspec.io/0.1.5/packages.html)
format

# setup

Each product folder must contain a `configuration.json` file, see [example](example)

## install

```shell
opctl pkg install github.com/opspec-pkgs/azure.apimanagement.products.set#1.0.0
```

## run

```
opctl run github.com/opspec-pkgs/azure.apimanagement.products.set#1.0.0
```

## compose

```yaml
op:
  pkg: { ref: github.com/opspec-pkgs/azure.apimanagement.products.set#1.0.0 }
  inputs:
    subscriptionId:
    loginId:
    loginSecret:
    loginTenantId:
    resourceGroup:
    apiManagementServiceName:
    products:
    # begin optional args
    loginType:
    variables:
    # end optional args
```

# Support

join us on
[![Slack](https://opspec-slackin.herokuapp.com/badge.svg)](https://opspec-slackin.herokuapp.com/)
or
[open an issue](https://github.com/opspec-pkgs/azure.apimanagement.products.set/issues)

# Releases

releases are versioned according to
[![semver 2.0.0](https://img.shields.io/badge/semver-2.0.0-brightgreen.svg)](http://semver.org/spec/v2.0.0.html)
and [tagged](https://git-scm.com/book/en/v2/Git-Basics-Tagging); see
[CHANGELOG.md](CHANGELOG.md) for release notes

# Contributing

see
[project/CONTRIBUTING.md](https://github.com/opspec-pkgs/project/blob/master/CONTRIBUTING.md)