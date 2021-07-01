const Gender = {
    LAKI_LAKI: 1,
    PEREMPUAN: 2,
    toString: function(gender){
        switch(gender){
            case this.LAKI_LAKI: 
                return 'Laki-Laki';
            case this.PEREMPUAN:
                return 'Perempuan';
            default: 
                return 'Tidak ada';
        }
    }
};

module.exports = Gender;