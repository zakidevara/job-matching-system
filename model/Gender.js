const Gender = {
    LAKI_LAKI: 1,
    PEREMPUAN: 2,
    toString: function(gender){
        return gender === Gender.LAKI_LAKI ? 'Laki-Laki' : 'Perempuan';
    }
};

module.exports = Gender;