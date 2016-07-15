"use strict"

const assert = require( 'assert' );
var $ = require( __dirname + '/../js/inc.js' );

exports = module.exports = test_inc;

function test_inc () {
    test_inc.test_extend();

    test_inc.test_merging();

    test_inc.test_merged();

    test_inc.test_deepsEqual();
}

test_inc.__proto__ = {
    test_extend : function() {
        assert.deepEqual( $.extend( { first : "first" }, { first : "second" } ), { first : "second" } );

        assert.deepEqual( $.extend( [ 'first', 'second' ], [ 'first', 'changed' ] ), [ 'first', 'changed' ] );

        assert.deepEqual( $.extend( {
            a : 'b',
            c : 'd',
            e : {
                f : 'g',
                h : 'i',
            },
            g : [
                'k',
                'l',
            ],
            m : {
                n : 'o',
            },
            p : {
                q : {
                    r : {
                        s : {
                            t : {
                                u : [
                                    'v',
                                ]
                            }
                        }
                    }
                }
            }
        }, {
            c : 'd改',
            e : {
                f : 'g2',
                h : 'i',
                h2 : 'i2',
            },
            g : [
                'k',
                'l改',
                'k2',
                'l2',
            ],
            m : 'n',
            p : {
                q : {
                    r : {
                        s : {
                            t : {
                                u : [
                                    'v改',
                                ]
                            }
                        }
                    }
                }
            }
        } ), {
            a : 'b',
            c : 'd改',
            e : {
                f : 'g2',
                h : 'i',
            },
            g : [
                'k',
                'l改',
            ],
            m : 'n',
            p : {
                q : {
                    r : {
                        s : {
                            t : {
                                u : [
                                    'v改',
                                ]
                            }
                        }
                    }
                }
            }
        } );
    },

    test_merging : function() {
        assert.deepEqual( $.merging( { first : "first" }, { second : "second" } ), { first : "first", second : "second" } );

        assert.deepEqual( $.merging( [ 'first', 'second' ], [ 'first', 'changed', 'added' ] ), [ 'first', 'changed', 'added' ] );

        assert.deepEqual( $.merging( {
            a : 'b',
            c : 'd',
            e : {
                f : 'g',
                h : 'i',
            },
            g : [
                'k',
                'l',
            ],
            m : {
                n : 'o',
            },
            p : {
                q : {
                    r : {
                        s : {
                            t : {
                                u : [
                                    'v',
                                ]
                            }
                        }
                    }
                }
            }
        }, {
            c : 'd改',
            e : {
                f : 'g2',
                h : 'i',
                h2 : 'i2',
            },
            g : [
                'k',
                'l改',
                'k2',
                'l2',
            ],
            m : 'n',
            p : {
                q : {
                    r : {
                        s : {
                            t : {
                                u : [
                                    'v改',
                                ]
                            }
                        }
                    }
                }
            }
        } ), {
            a : 'b',
            c : 'd改',
            e : {
                f : 'g2',
                h : 'i',
                h2 : 'i2',
            },
            g : [
                'k',
                'l改',
                'k2',
                'l2',
            ],
            m : 'n',
            p : {
                q : {
                    r : {
                        s : {
                            t : {
                                u : [
                                    'v改',
                                ]
                            }
                        }
                    }
                }
            }
        } );
    },
    
    test_merged: function() {
        assert.deepEqual( $.merged( { first : "first" }, { second : "second" } ), { first : "first", second : "second" } );

        assert.deepEqual( $.merged( [ 'first', 'second' ], [ 'first', 'changed', 'added' ] ), [ 'first', 'changed', 'added' ] );

        assert.deepEqual( $.merged( {
            a : 'b',
            c : 'd',
            e : {
                f : 'g',
                h : 'i',
            },
            g : [
                'k',
                'l',
            ],
            m : {
                n : 'o',
            },
            p : {
                q : {
                    r : {
                        s : {
                            t : {
                                u : [
                                    'v',
                                ]
                            }
                        }
                    }
                }
            }
        }, {
            c : 'd改',
            e : {
                f : 'g2',
                h : 'i',
                h2 : 'i2',
            },
            g : [
                'k',
                'l改',
                'k2',
                'l2',
            ],
            m : 'n',
            p : {
                q : {
                    r : {
                        s : {
                            t : {
                                u : [
                                    'v改',
                                ]
                            }
                        }
                    }
                }
            }
        } ), {
            a : 'b',
            c : 'd改',
            e : {
                f : 'g2',
                h : 'i',
                h2 : 'i2',
            },
            g : [
                'k',
                'l改',
                'k2',
                'l2',
            ],
            m : 'n',
            p : {
                q : {
                    r : {
                        s : {
                            t : {
                                u : [
                                    'v改',
                                ]
                            }
                        }
                    }
                }
            }
        } );
    },
    test_deepsEqual : function() {
        
        assert.ok( $.deepsEqual( {
            a : 'b',
            c : 'd改',
            e : {
                f : 'g2',
                h : 'i',
                h2 : 'i2',
            },
            g : [
                'k',
                'l改',
                'k2',
                'l2',
            ],
            m : 'n',
            p : {
                q : {
                    r : {
                        s : {
                            t : {
                                u : [
                                    'v改',
                                ]
                            }
                        }
                    }
                }
            }
        }, {
            a : 'b',
            c : 'd改',
            e : {
                f : 'g2',
                h : 'i',
                h2 : 'i2',
            },
            g : [
                'k',
                'l改',
                'k2',
                'l2',
            ],
            m : 'n',
            p : {
                q : {
                    r : {
                        s : {
                            t : {
                                u : [
                                    'v改',
                                ]
                            }
                        }
                    }
                }
            }
        } ) );

        function a() {}

        assert.ok( $.deepsEqual( {
            a,
        }, {
        }, ( a, b ) => {
            if ( typeof a == 'function' ) return true;
        } ) );
    },
};

